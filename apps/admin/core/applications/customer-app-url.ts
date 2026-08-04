const DEFAULT_CUSTOMER_APP_URL = "https://app.zimba.digital"
const DEFAULT_MARKETING_URL = "https://zimba.digital"

export function getCustomerAppUrl(): string {
  return (process.env.CUSTOMER_APP_URL ?? DEFAULT_CUSTOMER_APP_URL).replace(
    /\/+$/,
    ""
  )
}

/** The demo form lives on the marketing host, not the app host. */
export function getMarketingUrl(): string {
  return (process.env.MARKETING_URL ?? DEFAULT_MARKETING_URL).replace(/\/+$/, "")
}

/**
 * An approved applicant has no account yet — the workspace is waiting for
 * whoever registers with this email, so the email must send them to sign-up
 * with that address prefilled rather than to the workspace itself.
 */
export function getRegisterUrl(email: string): string {
  return `${getCustomerAppUrl()}/register?email=${encodeURIComponent(email)}`
}
