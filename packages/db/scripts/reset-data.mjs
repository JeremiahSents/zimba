// Empties the development database: every row in every table goes, the schema
// and the migration history stay. Use it when seed data has drifted and you
// want a blank slate without re-running migrations.
//
//   pnpm --filter @workspace/db db:reset-data
//
// Refuses to run unless the database looks like a development one. Point it at
// something real on purpose with --i-know-what-im-doing, and take a backup
// first (`node scripts/backup-json.mjs`).
import { config } from "dotenv"
import pg from "pg"

config({ path: "../../.env", quiet: true })

const raw = process.env.DATABASE_URL
if (!raw) throw new Error("DATABASE_URL is required.")

const connectionString = raw.replace(/^postgresql\+psycopg:/, "postgresql:")
const override = process.argv.includes("--i-know-what-im-doing")

/**
 * Local hosts, and names that say "dev" out loud. Anything else is assumed to
 * be someone's real data until the caller insists otherwise.
 */
function looksLikeDevelopmentDatabase(url) {
  const parsed = new URL(url)
  const host = parsed.hostname.toLowerCase()
  const database = parsed.pathname.replace(/^\//, "").toLowerCase()
  const isLocalHost =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.endsWith(".localhost")
  const isNamedDev = /(^|[-_])(dev|development|local|test)([-_]|$)/.test(
    database
  )
  return { isLocalHost, isNamedDev, host, database }
}

const { isLocalHost, isNamedDev, host, database } =
  looksLikeDevelopmentDatabase(connectionString)

if (process.env.NODE_ENV === "production" && !override) {
  console.error("Refusing to run: NODE_ENV is production.")
  process.exit(1)
}

if (!isLocalHost && !isNamedDev && !override) {
  console.error(
    `Refusing to run: "${database}" on ${host} does not look like a development database.\n` +
      "Back it up first, then pass --i-know-what-im-doing if you really mean it."
  )
  process.exit(1)
}

const client = new pg.Client({ connectionString })
await client.connect()

// drizzle keeps its journal in its own schema, so restricting this to "public"
// is what stops a reset from looking like an un-migrated database afterwards.
const { rows: tables } = await client.query(
  `select table_name from information_schema.tables
   where table_schema = 'public' and table_type = 'BASE TABLE'
   order by table_name`
)

if (!tables.length) {
  console.log("No tables found in the public schema — nothing to reset.")
  await client.end()
  process.exit(0)
}

const { rows: before } = await client.query(
  tables
    .map(
      ({ table_name }) =>
        `select '${table_name}' as name, count(*)::int as rows from public."${table_name}"`
    )
    .join(" union all ")
)
const totalBefore = before.reduce((sum, row) => sum + row.rows, 0)

// One TRUNCATE for all of them: CASCADE alone would still trip over circular
// foreign keys if the tables were emptied one at a time.
const targets = tables
  .map(({ table_name }) => `public."${table_name}"`)
  .join(", ")

try {
  await client.query("begin")
  await client.query(`truncate table ${targets} restart identity cascade`)
  await client.query("commit")
} catch (error) {
  await client.query("rollback")
  await client.end()
  throw error
}

await client.end()

for (const row of before
  .filter((row) => row.rows > 0)
  .sort((a, b) => b.rows - a.rows))
  console.log(`  ${row.name}: ${row.rows} -> 0`)

console.log(
  `\nEmptied ${tables.length} tables on "${database}" (${totalBefore} rows removed).` +
    "\nRun `pnpm --filter @workspace/db db:seed` to load seed data."
)
