import "server-only"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { env } from "./env"
import { classifyError } from "./error-classifier"
import { logApplicationError } from "./error-logger"
import type { PublicError } from "./errors"
import * as schema from "./schema"

const globalForDatabase = globalThis as unknown as {
  zimbaPool?: Pool
}

function createPool() {
  // Keep the driver's current secure behavior explicit and silence the
  // pg-connection-string forward-compatibility warning for sslmode=require.
  const connectionUrl = new URL(env.DATABASE_URL)
  if (connectionUrl.searchParams.get("sslmode") === "require") {
    connectionUrl.searchParams.set("sslmode", "verify-full")
  }

  const pool = new Pool({
    connectionString: connectionUrl.toString(),
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    max: 10,
    query_timeout: 15_000,
    statement_timeout: 15_000,
    onConnect: async (client) => {
      await client.query("set search_path to public")
    },
  })

  pool.on("error", (error) => {
    logApplicationError(classifyError(error, "database.pool"))
  })

  return pool
}

export const pool = globalForDatabase.zimbaPool ?? createPool()

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.zimbaPool = pool
}

export { schema }
export const db = drizzle(pool, { schema })

export async function checkDatabaseHealth(): Promise<
  { healthy: true } | { healthy: false; error: PublicError }
> {
  try {
    await pool.query("select 1")
    return { healthy: true }
  } catch (error) {
    const applicationError = classifyError(error, "database.health")
    logApplicationError(applicationError)
    return { healthy: false, error: applicationError.toPublicError() }
  }
}
