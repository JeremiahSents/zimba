export const APP_ORIGIN = "https://app.zimba.digital"

/**
 * Auth pages have to be reached on the app subdomain: Better Auth trusts that
 * one origin, so a form posted from the marketing host (www.zimba.digital) is
 * refused with "Invalid origin". Local development stays relative so a
 * developer testing the site is never sent to production.
 */
export function getAppHref(path: string, nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === "production" ? `${APP_ORIGIN}${path}` : path
}

export function getLoginHref(nodeEnv = process.env.NODE_ENV) {
  return getAppHref("/login", nodeEnv)
}

export function getOnboardingHref(nodeEnv = process.env.NODE_ENV) {
  return getAppHref("/onboarding", nodeEnv)
}
