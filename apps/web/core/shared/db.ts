import "server-only"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { env } from "./env"
import * as schema from "./schema"

const globalForDatabase = globalThis as unknown as {
  zimbaPool?: Pool
}

function createPool() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    onConnect: async (client) => {
      await client.query("set search_path to public")
    },
  })

  return pool
}

export const pool = globalForDatabase.zimbaPool ?? createPool()

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.zimbaPool = pool
}

export { schema }
export const db = drizzle(pool, { schema })
