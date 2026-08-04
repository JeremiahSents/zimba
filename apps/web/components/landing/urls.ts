export const APP_ORIGIN = "https://app.zimba.digital"

/** Where the demo form lives. The app host has no landing page of its own. */
export const MARKETING_ORIGIN = "https://zimba.digital"

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

export function getRegisterHref(nodeEnv = process.env.NODE_ENV) {
  return getAppHref("/register", nodeEnv)
}

/**
 * Points back at the marketing landing page. Used from app pages (someone
 * signed in with no workspace) where a relative "#book-demo" would go nowhere.
 */
export function getBookDemoHref(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === "production"
    ? `${MARKETING_ORIGIN}/#book-demo`
    : "/#book-demo"
}
