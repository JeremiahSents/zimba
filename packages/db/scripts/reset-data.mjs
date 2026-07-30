// Empties whatever DATABASE_URL points at: every row in every table goes, the
// schema and the migration history stay. Use it when seed data has drifted and
// you want a blank slate without re-running migrations.
//
//   pnpm db:reset
//   pnpm db:reset -- --backup    # dump to .backups/ first
//
// This wipes the database named in the banner it prints. There is no "is this
// really dev?" check, because a connection string cannot answer that — a managed
// host looks identical either way, and the guess got it wrong often enough to be
// worse than useless. The banner is the check: read it before you hit enter.
//
// The one refusal left is NODE_ENV=production, which never fires locally.
// Override with --i-know-what-im-doing.
import { config } from "dotenv"
import pg from "pg"

config({ path: "../../.env", quiet: true })

const raw = process.env.DATABASE_URL
if (!raw) throw new Error("DATABASE_URL is required.")

const connectionString = raw.replace(/^postgresql\+psycopg:/, "postgresql:")
const override = process.argv.includes("--i-know-what-im-doing")
const wantsBackup = process.argv.includes("--backup")

const target = new URL(connectionString)
const host = target.hostname
const database = target.pathname.replace(/^\//, "")

if (process.env.NODE_ENV === "production" && !override) {
  console.error(
    "Refusing to run: NODE_ENV is production. Pass --i-know-what-im-doing to override."
  )
  process.exit(1)
}

console.log(`Emptying every table in "${database}" on ${host}`)

if (wantsBackup) {
  const { execFileSync } = await import("node:child_process")
  execFileSync(process.execPath, ["scripts/backup-json.mjs"], {
    stdio: "inherit",
  })
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
