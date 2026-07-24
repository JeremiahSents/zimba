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
