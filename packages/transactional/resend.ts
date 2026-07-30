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
}): SendEmailResult {
  const links = extractLinks(params.html)
  console.info(
    [
      "",
      "──────── email (console transport) ────────",
      `to:      ${params.to}`,
      `from:    ${getFromAddress()}`,
      `subject: ${params.subject}`,
      ...(links.length ? ["links:", ...links.map((url) => `  ${url}`)] : []),
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
}): Promise<SendEmailResult> {
  if (usesConsoleTransport()) return logEmail(params)

  const client = getResend()
  let response: Awaited<ReturnType<typeof client.emails.send>>
  try {
    response = await client.emails.send({
      from: getFromAddress(),
      to: params.to,
      subject: params.subject,
      html: params.html,
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
