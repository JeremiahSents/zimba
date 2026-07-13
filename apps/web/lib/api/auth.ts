import "server-only"

export type ZimbaApiSession = {
  token: string
  organizationId: string
}

export function getZimbaApiSession(): ZimbaApiSession | null {
  const token = process.env.ZIMBA_API_SESSION_TOKEN
  const organizationId = process.env.ZIMBA_ORGANIZATION_ID

  if (!token || !organizationId) {
    return null
  }

  return { token, organizationId }
}
