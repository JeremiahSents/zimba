import { config } from "dotenv"
import { sql } from "drizzle-orm"

config({ path: "../../apps/web/.env.local", quiet: true })

const { db, pool } = await import("./index")
const schema = await import("./schemas/index")

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

  await db.execute(sql`
    insert into "allocation" (
      "id",
      "organization_id",
      "project_id",
      "name",
      "budget_cents"
    )
    values (
      ${budgetItemId},
      ${orgId},
      ${projectId},
      'Foundation Materials',
      5000000
    )
    on conflict do nothing
  `)

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

  await db.execute(sql`
    insert into "expense_line" (
      "id",
      "organization_id",
      "expense_id",
      "allocation_id",
      "budget_item_id",
      "item_description",
      "quantity",
      "unit_rate_cents",
      "amount_cents"
    )
    values (
      'exp_line_1',
      ${orgId},
      ${expenseId},
      ${budgetItemId},
      ${budgetItemId},
      'Cement bags',
      100,
      35000,
      3500000
    )
    on conflict do nothing
  `)

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
