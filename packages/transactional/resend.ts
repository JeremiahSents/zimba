import { Resend } from "resend"

let resendInstance: Resend | null = null

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not defined in environment variables.")
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

export function getFromAddress(): string {
  return process.env.RESEND_FROM ?? "Zimba <noreply@zimba.digital>"
}

export type SendEmailResult = {
  id: string | null
  error: string | null
}

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<SendEmailResult> {
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
    throw new Error(`Email send failed: ${message}`)
  }

  if (response.error) {
    throw new Error(
      `Email send rejected: ${response.error.message ?? "Unknown error"}`
    )
  }

  return {
    id: response.data?.id ?? null,
    error: null,
  }
}
