import { config } from "dotenv"

config({ path: "../../apps/web/.env.local", quiet: true })

const { db, pool } = await import("./index")
const schema = await import("./schema")

async function main() {
  console.log("Seeding database...")

  const orgId = "org_1"
  await db
    .insert(schema.organization)
    .values({
      id: orgId,
      name: "Zimba Dev Org",
      slug: "zimba-dev",
    })
    .onConflictDoNothing()

  const projectId = "proj_1"
  await db
    .insert(schema.project)
    .values({
      id: projectId,
      organizationId: orgId,
      name: "Kampala Tower",
      location: "Kampala",
      status: "active",
    })
    .onConflictDoNothing()

  const budgetItemId = "alloc_1"
  await db
    .insert(schema.budgetItem)
    .values({
      id: budgetItemId,
      organizationId: orgId,
      projectId,
      name: "Foundation Materials",
      budgetCents: 5_000_000,
    })
    .onConflictDoNothing()

  const supplierId = "supp_1"
  await db
    .insert(schema.supplier)
    .values({
      id: supplierId,
      organizationId: orgId,
      name: "Hardware World",
    })
    .onConflictDoNothing()

  const expenseId = "exp_1"
  await db
    .insert(schema.expense)
    .values({
      id: expenseId,
      organizationId: orgId,
      projectId,
      supplierId,
      paymentStatus: "unpaid",
    })
    .onConflictDoNothing()

  await db
    .insert(schema.expenseLine)
    .values({
      id: "exp_line_1",
      organizationId: orgId,
      expenseId,
      allocationId: budgetItemId,
      itemDescription: "Cement bags",
      quantity: 100,
      unitRateCents: 35_000,
      amountCents: 3_500_000,
    })
    .onConflictDoNothing()

  console.log("Done seeding!")
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
