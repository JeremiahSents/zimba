const DEFAULT_CUSTOMER_APP_URL = "https://app.zimba.digital"

export function getCustomerAppUrl(): string {
  return (process.env.CUSTOMER_APP_URL ?? DEFAULT_CUSTOMER_APP_URL).replace(
    /\/+$/,
    ""
  )
}
