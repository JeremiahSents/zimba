import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const globalForDatabase = globalThis as unknown as {
  zimbaPool?: Pool
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.")
  }

  const connectionUrl = new URL(databaseUrl.replace(/^postgresql\+psycopg:/, "postgresql:"))

  if (connectionUrl.searchParams.get("sslmode") === "require") {
    connectionUrl.searchParams.set("sslmode", "verify-full")
  }

  return connectionUrl.toString()
}

function createPool() {
  const pool = new Pool({
    connectionString: getDatabaseUrl(),
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis: 30_000,
    keepAlive: true,
    max: 10,
    query_timeout: 15_000,
    statement_timeout: 15_000,
    onConnect: async (client) => {
      await client.query("set search_path to public")
    },
  })

  pool.on("error", (error) => {
    console.error("database.pool", error)
  })

  return pool
}

export const pool = globalForDatabase.zimbaPool ?? createPool()

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.zimbaPool = pool
}

export { schema }
export * from "./schema"

export const db = drizzle(pool, { schema })

export async function checkDatabaseHealth() {
  await pool.query("select 1")
}
