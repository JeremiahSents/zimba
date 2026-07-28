// Full JSON snapshot of every table in the public schema.
// Used before destructive migrations when pg_dump's version does not match the
// server. Writes .backups/zimba-<timestamp>.json at the repo root.
import { mkdirSync, writeFileSync } from "node:fs"
import { config } from "dotenv"
import pg from "pg"

config({ path: "../../.env", quiet: true })

const raw = process.env.DATABASE_URL
if (!raw) throw new Error("DATABASE_URL is required.")

const client = new pg.Client({
  connectionString: raw.replace(/^postgresql\+psycopg:/, "postgresql:"),
})
await client.connect()

const { rows: tables } = await client.query(
  `select table_name from information_schema.tables
   where table_schema = 'public' order by table_name`
)

const snapshot = {}
for (const { table_name } of tables) {
  const { rows } = await client.query(`select * from public."${table_name}"`)
  snapshot[table_name] = rows
  console.log(`${table_name}: ${rows.length}`)
}

await client.end()

mkdirSync("../../.backups", { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, "-")
const out = `../../.backups/zimba-${stamp}.json`
writeFileSync(out, JSON.stringify(snapshot, null, 2))
console.log(
  `\nWrote ${out} — ${tables.length} tables, ${Object.values(snapshot).reduce((n, r) => n + r.length, 0)} rows total`
)
