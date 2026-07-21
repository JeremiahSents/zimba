export function buildInviteUrl(token: string, appUrl?: string): string {
  const base =
    appUrl ??
    process.env.APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000"
  return `${base.replace(/\/+$/, "")}/invite/${token}`
}
