import "server-only"
import { db } from "@workspace/db"
import { user, organizationMember, platformUser } from "@workspace/db/schema"
import { desc, eq } from "drizzle-orm"

export async function listPlatformUsers() {
  const users = await db.query.user.findMany({
    orderBy: [desc(user.createdAt)],
    with: {
      organizationMemberships: {
        with: {
          organization: true
        }
      }
    }
  })

  // We fetch platform roles separately if needed, or we could join
  const platformUsers = await db.query.platformUser.findMany()
  const roleMap = new Map(platformUsers.map(pu => [pu.userId, pu.role]))

  return users.map(u => ({
    ...u,
    platformRole: roleMap.get(u.id) || "none",
    membershipsCount: u.organizationMemberships.length,
    primaryOrganization: u.organizationMemberships[0]?.organization?.name || "None"
  }))
}

export async function getPlatformUserDetail(id: string) {
  const u = await db.query.user.findFirst({
    where: eq(user.id, id),
    with: {
      organizationMemberships: {
        with: {
          organization: true
        }
      },
      accounts: true,
      sessions: true
    }
  })

  if (!u) return null

  const pUser = await db.query.platformUser.findFirst({
    where: eq(platformUser.userId, id)
  })

  return {
    ...u,
    platformRole: pUser?.role || "none",
  }
}
