import { config } from "dotenv"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

config({ path: ".env.local", quiet: true })

const databaseUrl = process.env.DATABASE_URL?.replace(
  /^postgresql\+psycopg:/,
  "postgresql:"
)

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.")
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
})

const db = drizzle(pool, { schema })

async function main() {
  console.log("Seeding database...")

  const orgId = "org_1"
  await db.insert(schema.organization).values({
    id: orgId,
    name: "Zimba Dev Org",
    slug: "zimba-dev",
  }).onConflictDoNothing()

  const projectId = "proj_1"
  await db.insert(schema.project).values({
    id: projectId,
    organizationId: orgId,
    name: "Kampala Tower",
    location: "Kampala",
    status: "active",
  }).onConflictDoNothing()

  const allocationId = "alloc_1"
  await db.insert(schema.allocation).values({
    id: allocationId,
    organizationId: orgId,
    projectId: projectId,
    name: "Foundation Materials",
    budgetCents: 5000000,
  }).onConflictDoNothing()

  const supplierId = "supp_1"
  await db.insert(schema.supplier).values({
    id: supplierId,
    organizationId: orgId,
    name: "Hardware World",
  }).onConflictDoNothing()

  const expenseId = "exp_1"
  await db.insert(schema.expense).values({
    id: expenseId,
    organizationId: orgId,
    projectId: projectId,
    supplierId: supplierId,
    paymentStatus: "unpaid",
  }).onConflictDoNothing()

  await db.insert(schema.expenseLine).values({
    id: "exp_line_1",
    organizationId: orgId,
    expenseId: expenseId,
    allocationId: allocationId,
    itemDescription: "Cement bags",
    quantity: 100,
    unitRateCents: 35000,
    amountCents: 3500000,
  }).onConflictDoNothing()

  console.log("Done seeding!")
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  pool.end().finally(() => {
    process.exit(1)
  })
})
