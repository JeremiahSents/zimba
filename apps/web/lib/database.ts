import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as authSchema from "@/lib/auth-schema"
import * as organizationSchema from "@/lib/organization-schema"

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.")
  }

  return databaseUrl.replace(/^postgresql\+psycopg:/, "postgresql:")
}

const globalForDatabase = globalThis as unknown as {
  zimbaPool?: Pool
}

export const pool =
  globalForDatabase.zimbaPool ??
  new Pool({
    connectionString: getDatabaseUrl(),
    max: 10,
  })

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.zimbaPool = pool
}

export const db = drizzle(pool, {
  schema: { ...authSchema, ...organizationSchema },
})
