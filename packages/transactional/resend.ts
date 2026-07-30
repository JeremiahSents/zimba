import { Resend } from "resend"

let resendInstance: Resend | null = null

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw Object.assign(
        new Error("RESEND_API_KEY is not defined in environment variables."),
        { code: "EMAIL_SERVICE_ERROR" }
      )
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

export function getFromAddress(): string {
  return process.env.RESEND_FROM ?? "Zimba <onboarding@resend.dev>"
}

export type SendEmailResult = {
  id: string | null
  error: string | null
}

export type EmailAttachment = {
  filename: string
  /**
   * A URL Resend fetches for itself. Preferred: generated documents already
   * live in object storage, so pulling the bytes back through this process only
   * to base64 them — a third larger again — buys nothing.
   */
  path?: string
  /** Raw bytes, for the rarer case where the caller already holds them. */
  content?: Buffer
  contentType?: string
}

/**
 * Resend allows roughly 40 MB per message and base64 inflates by a third. No
 * document this system generates comes close, so this is a guard against a
 * runaway table rather than a real limit.
 */
const MAX_INLINE_ATTACHMENT_BYTES = 8 * 1024 * 1024

/**
 * Local development should not depend on a verified domain, DNS, or a real
 * inbox. When the console transport is on, mail is printed to the terminal with
 * its links pulled out, so a confirmation or reset link is one click away.
 *
 * On by default whenever RESEND_API_KEY is absent, and forceable with
 * EMAIL_TRANSPORT=console. Never available in production: a silent no-op there
 * would mean customers never hear from us and nothing would look broken.
 */
function usesConsoleTransport(): boolean {
  if (process.env.NODE_ENV === "production") return false
  const transport = process.env.EMAIL_TRANSPORT?.trim().toLowerCase()
  if (transport === "console") return true
  if (transport === "resend") return false
  return !process.env.RESEND_API_KEY
}

/**
 * The actionable part of a transactional email is almost always a link. Two
 * things have to be right for the printed URL to be clickable: entities have to
 * be decoded (the raw HTML carries `&amp;`, which would truncate a query string
 * when pasted into a browser), and boilerplate like the doctype DTD and asset
 * URLs has to be dropped so the real link is the only thing on screen.
 */
function extractLinks(html: string): string[] {
  const matches = html.match(/https?:\/\/[^"'\s<>]+/g) ?? []
  const decoded = matches.map((url) =>
    url
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
  )
  return [...new Set(decoded)].filter((url) => {
    if (/^https?:\/\/(www\.)?w3\.org\//.test(url)) return false
    if (url.endsWith(".dtd")) return false
    if (/\/\/fonts\./.test(url)) return false
    return !/\.(png|jpe?g|gif|svg|webp|ico|css)(\?|$)/i.test(url)
  })
}

function logEmail(params: {
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
}): SendEmailResult {
  const links = extractLinks(params.html)
  // Printed explicitly: without it the console transport gives no signal about
  // whether an attachment was actually wired up, which is the one thing worth
  // checking when developing a document email.
  const attachments = (params.attachments ?? []).map(
    (attachment) =>
      `  ${attachment.filename}${
        attachment.path
          ? ` -> ${attachment.path}`
          : attachment.content
            ? ` (${attachment.content.byteLength} bytes inline)`
            : " (empty)"
      }`
  )
  console.info(
    [
      "",
      "──────── email (console transport) ────────",
      `to:      ${params.to}`,
      `from:    ${getFromAddress()}`,
      `subject: ${params.subject}`,
      ...(links.length ? ["links:", ...links.map((url) => `  ${url}`)] : []),
      ...(attachments.length ? ["attachments:", ...attachments] : []),
      "──────────────────────────────────────────",
      "",
    ].join("\n")
  )
  return { id: `console-${crypto.randomUUID()}`, error: null }
}

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
}): Promise<SendEmailResult> {
  for (const attachment of params.attachments ?? []) {
    if (
      attachment.content &&
      attachment.content.byteLength > MAX_INLINE_ATTACHMENT_BYTES
    ) {
      throw Object.assign(
        new Error(
          `Attachment ${attachment.filename} is too large to send inline.`
        ),
        { code: "EMAIL_SERVICE_ERROR" }
      )
    }
  }

  if (usesConsoleTransport()) return logEmail(params)

  const client = getResend()
  let response: Awaited<ReturnType<typeof client.emails.send>>
  try {
    response = await client.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.attachments?.length
        ? { attachments: params.attachments }
        : {}),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    throw Object.assign(new Error(`Email send failed: ${message}`), {
      code: "EMAIL_SERVICE_ERROR",
      cause: error,
    })
  }

  if (response.error) {
    throw Object.assign(
      new Error(
        `Email send rejected: ${response.error.message ?? "Unknown error"}`
      ),
      { code: "EMAIL_SERVICE_ERROR" }
    )
  }

  return {
    id: response.data?.id ?? null,
    error: null,
  }
}
