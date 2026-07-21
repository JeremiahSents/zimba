export const APP_ORIGIN = "https://app.zimba.digital"

export function getLoginHref(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === "production" ? `${APP_ORIGIN}/login` : "/login"
}
