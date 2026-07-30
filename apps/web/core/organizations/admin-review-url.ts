const DEFAULT_ADMIN_APP_URL = "https://admin.zimba.digital"

function getAdminAppUrl(): string {
  return (process.env.ADMIN_APP_URL ?? DEFAULT_ADMIN_APP_URL).replace(
    /\/+$/,
    ""
  )
}

/**
 * Deep link to the review page for one request. Only ever put in email to
 * super admins — customer-facing pages never link into the admin console.
 */
export function getApplicationReviewUrl(applicationId: string): string {
  return `${getAdminAppUrl()}/applications/${applicationId}`
}
