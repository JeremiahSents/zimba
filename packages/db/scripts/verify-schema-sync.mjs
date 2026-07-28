// Compares the live database against the newest drizzle snapshot: tables,
// columns, foreign keys and check constraints. Run after a migration to prove
// the schema and the snapshot agree, so the next `drizzle-kit generate` is empty.
import { readdirSync, readFileSync } from "node:fs"
import { config } from "dotenv"
import pg from "pg"

config({ path: "../../.env", quiet: true })

const META = "drizzle/meta"
const newest = readdirSync(META)
  .filter((f) => f.endsWith("_snapshot.json"))
  .sort()
  .at(-1)
const snap = JSON.parse(readFileSync(`${META}/${newest}`, "utf8"))
console.log(`comparing live database against ${newest}\n`)

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL.replace(
    /^postgresql\+psycopg:/,
    "postgresql:"
  ),
})
await client.connect()
await client.query("set search_path to public")

const expectedTables = new Set(
  Object.keys(snap.tables).map((t) => t.replace("public.", ""))
)
const { rows: liveRows } = await client.query(
  `select table_name from information_schema.tables where table_schema='public'`
)
const liveTables = new Set(liveRows.map((r) => r.table_name))

const missing = [...expectedTables].filter((t) => !liveTables.has(t))
const extra = [...liveTables].filter((t) => !expectedTables.has(t))

let problems = 0
const report = (label, items) => {
  if (items.length) {
    problems += items.length
    console.log(`MISMATCH ${label}: ${items.join(", ")}`)
  }
}
report("tables in snapshot but not in database", missing)
report("tables in database but not in snapshot", extra)

for (const table of [...expectedTables]
  .filter((t) => liveTables.has(t))
  .sort()) {
  const spec = snap.tables[`public.${table}`]
  const { rows: cols } = await client.query(
    `select column_name from information_schema.columns
     where table_schema='public' and table_name=$1`,
    [table]
  )
  const live = new Set(cols.map((c) => c.column_name))
  const want = new Set(Object.keys(spec.columns))
  report(
    `${table} columns missing`,
    [...want].filter((c) => !live.has(c))
  )
  report(
    `${table} columns unexpected`,
    [...live].filter((c) => !want.has(c))
  )

  const { rows: cons } = await client.query(
    `select conname, contype from pg_constraint where conrelid = $1::regclass`,
    [table]
  )
  const liveCons = new Set(cons.map((c) => c.conname))
  report(
    `${table} foreign keys missing`,
    Object.keys(spec.foreignKeys ?? {}).filter((f) => !liveCons.has(f))
  )
  report(
    `${table} check constraints missing`,
    Object.keys(spec.checkConstraints ?? {}).filter((c) => !liveCons.has(c))
  )
}

await client.end()
console.log(
  problems === 0
    ? "\nIn sync: live schema matches the snapshot."
    : `\n${problems} mismatch(es) — see above.`
)
process.exitCode = problems === 0 ? 0 : 1
