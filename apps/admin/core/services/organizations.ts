import "server-only"
import { db } from "@workspace/db"
import { organization, organizationMember, project, user } from "@workspace/db/schema"
import { desc, eq, sql } from "drizzle-orm"

export async function listOrganizations() {
  // Simple select for now, we can add stats later via joins if needed
  const orgs = await db.query.organization.findMany({
    orderBy: [desc(organization.createdAt)],
    with: {
      members: {
        columns: { id: true }
      },
      projects: {
        columns: { id: true }
      }
    }
  })

  return orgs.map(org => ({
    ...org,
    userCount: org.members.length,
    projectCount: org.projects.length,
  }))
}

export async function getOrganizationDetail(id: string) {
  const org = await db.query.organization.findFirst({
    where: eq(organization.id, id),
    with: {
      members: {
        with: {
          user: true
        }
      },
      projects: true,
      suppliers: true
    }
  })
  
  return org
}
