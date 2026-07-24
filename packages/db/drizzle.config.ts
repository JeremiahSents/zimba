import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: "../../apps/web/.env.local", quiet: true })

const databaseUrl = process.env.DATABASE_URL?.replace(
  /^postgresql\+psycopg:/,
  "postgresql:"
)

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run Drizzle migrations.")
}

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schemas/index.ts",
  dbCredentials: {
    url: databaseUrl,
  },
})
