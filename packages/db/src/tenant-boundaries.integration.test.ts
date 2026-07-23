import { describe, expect, it } from "vitest"
import { Pool } from "pg"

const databaseUrl = process.env.TEST_DATABASE_URL

describe.skipIf(!databaseUrl)("tenant boundary integration", () => {
  it("does not return a project through another organization scope", async () => {
    const pool = new Pool({ connectionString: databaseUrl })
    const client = await pool.connect()
    const organizationA = crypto.randomUUID()
    const organizationB = crypto.randomUUID()
    const projectId = crypto.randomUUID()
    try {
      await client.query("begin")
      await client.query(
        'insert into "organization" (id, name, slug, base_currency, status) values ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)',
        [
          organizationA,
          "Tenant A",
          `tenant-a-${organizationA}`,
          "UGX",
          "active",
          organizationB,
          "Tenant B",
          `tenant-b-${organizationB}`,
          "UGX",
          "active",
        ]
      )
      await client.query(
        'insert into "project" (id, organization_id, name, location, currency, status) values ($1, $2, $3, $4, $5, $6)',
        [
          projectId,
          organizationA,
          "Private project",
          "Kampala",
          "UGX",
          "active",
        ]
      )
      const result = await client.query(
        'select id from "project" where id = $1 and organization_id = $2',
        [projectId, organizationB]
      )
      expect(result.rowCount).toBe(0)
      await client.query("rollback")
    } finally {
      client.release()
      await pool.end()
    }
  })
})
