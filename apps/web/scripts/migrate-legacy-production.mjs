import { createHash } from "node:crypto"
import { resolve } from "node:path"
import process from "node:process"
import dotenv from "dotenv"
import pg from "pg"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

const apply = process.argv.includes("--apply")
const sourceUrl = process.env.DATABASE_URL?.replace(
  "postgresql+psycopg://",
  "postgresql://"
)
const targetUrl = process.env.DEV_DATABASE_URL?.replace(
  "postgresql+psycopg://",
  "postgresql://"
)

if (!sourceUrl || !targetUrl)
  throw new Error("DATABASE_URL and DEV_DATABASE_URL are required")
if (sourceUrl === targetUrl)
  throw new Error("Source and target database URLs must be different")

const source = new pg.Client({ connectionString: sourceUrl })
const target = new pg.Client({ connectionString: targetUrl })

function legacyId(entity, value) {
  const hex = createHash("sha256")
    .update(`zimba:${entity}:${value}`)
    .digest("hex")
    .slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20)}`
}

function normalizeProjectStatus(status) {
  if (status === "completed") return "completed"
  if (status === "archived") return "on_hold"
  return "active"
}

function normalizePaymentStatus(status) {
  if (status === "paid") return "paid"
  if (status === "partially_paid" || status === "partial") return "partial"
  return "unpaid"
}

function normalizePayableStatus(status) {
  if (["paid", "posted", "converted_to_expense"].includes(status)) return "paid"
  return "pending"
}

function quoteIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`
}

async function insertRow(client, table, row) {
  const entries = Object.entries(row)
  const columns = entries.map(([key]) => quoteIdentifier(key)).join(", ")
  const placeholders = entries.map((_, index) => `$${index + 1}`).join(", ")
  await client.query(
    `INSERT INTO ${quoteIdentifier(table)} (${columns}) VALUES (${placeholders})`,
    entries.map(([, value]) => value)
  )
}

async function readTable(client, table, orderBy = "id") {
  return (
    await client.query(
      `SELECT * FROM ${quoteIdentifier(table)} ORDER BY ${quoteIdentifier(orderBy)}`
    )
  ).rows
}

async function commonColumns(table) {
  const sql = `
    SELECT column_name, is_nullable, column_default, is_identity
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position`
  const sourceColumns = (await source.query(sql, [table])).rows
  const targetColumns = (await target.query(sql, [table])).rows
  const sourceNames = new Set(sourceColumns.map((column) => column.column_name))
  const common = targetColumns.filter((column) =>
    sourceNames.has(column.column_name)
  )
  const missingRequired = targetColumns.filter(
    (column) =>
      !sourceNames.has(column.column_name) &&
      column.is_nullable === "NO" &&
      column.column_default === null &&
      column.is_identity === "NO"
  )
  if (missingRequired.length > 0) {
    throw new Error(
      `${table} is missing required target columns: ${missingRequired.map((c) => c.column_name).join(", ")}`
    )
  }
  return common.map((column) => column.column_name)
}

async function copyCompatibleTable(table) {
  const columns = await commonColumns(table)
  if (columns.length === 0) return 0
  const selected = columns.map(quoteIdentifier).join(", ")
  const rows = (
    await source.query(`SELECT ${selected} FROM ${quoteIdentifier(table)}`)
  ).rows
  for (const row of rows) await insertRow(target, table, row)
  return rows.length
}

async function getSourceData() {
  const tables = [
    "projects",
    "tasks",
    "suppliers",
    "expenses",
    "upcoming_payments",
    "uploaded_files",
    "payable_expenses",
    "payable_expense_lines",
    "ledger_payments",
    "ledger_payment_allocations",
    "ledger_payment_reversals",
    "financial_audit_events",
  ]
  const result = {}
  for (const table of tables) result[table] = await readTable(source, table)
  return result
}

function buildMigration(data) {
  const projectIds = new Map(
    data.projects.map((row) => [row.id, legacyId("project", row.id)])
  )
  const allocationIds = new Map(
    data.tasks.map((row) => [row.id, legacyId("allocation", row.id)])
  )
  const supplierIds = new Map(
    data.suppliers.map((row) => [row.id, legacyId("supplier", row.id)])
  )
  const payableIds = new Map(
    data.payable_expenses.map((row) => [row.id, legacyId("payable", row.id)])
  )
  const expenseGroupIds = new Map(
    data.expenses.map((row) => {
      const group = row.receipt_id ?? row.id
      return [group, legacyId("expense", group)]
    })
  )

  const organizationOwner = new Map()
  const projects = data.projects.map((row) => ({
    id: projectIds.get(row.id),
    organization_id: row.organization_id,
    name: row.name,
    location: row.location,
    plot_size: row.plot_size,
    land_size: row.land_size,
    building_type: row.building_type,
    client_name: row.client_name,
    status: normalizeProjectStatus(row.status),
    currency: "UGX",
    start_date: row.start_date,
    target_end_date: row.target_end_date,
    archived_at: null,
    archived_by: null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))

  const allocations = data.tasks.map((row) => {
    const project = data.projects.find((item) => item.id === row.project_id)
    if (!project)
      throw new Error(
        `Task ${row.id} references missing project ${row.project_id}`
      )
    return {
      id: allocationIds.get(row.id),
      organization_id: project.organization_id,
      project_id: projectIds.get(row.project_id),
      name: row.name,
      budget_cents: row.budget,
      created_at: project.created_at,
      updated_at: project.updated_at,
    }
  })

  const suppliers = data.suppliers.map((row) => ({
    id: supplierIds.get(row.id),
    organization_id: row.organization_id,
    name: row.name,
    phone: row.phone,
    email: null,
    notes: null,
    company_contact: null,
    contact_name: null,
    category: "other",
    status: "active",
    created_at: new Date(),
    updated_at: new Date(),
  }))

  const expenseGroups = Map.groupBy(
    data.expenses,
    (row) => row.receipt_id ?? row.id
  )
  const expenses = []
  const expenseLines = []
  for (const [group, rows] of expenseGroups) {
    const first = rows[0]
    expenses.push({
      id: expenseGroupIds.get(group),
      organization_id: first.organization_id,
      project_id: projectIds.get(first.project_id),
      supplier_id:
        first.supplier_id == null ? null : supplierIds.get(first.supplier_id),
      payment_status: normalizePaymentStatus(first.payment_status),
      receipt_file_id: first.receipt_file_id,
      expense_date: first.date,
      created_at: first.created_at,
      updated_at: first.updated_at,
    })
    for (const row of rows) {
      expenseLines.push({
        id: legacyId("expense-line", row.id),
        organization_id: row.organization_id,
        expense_id: expenseGroupIds.get(group),
        allocation_id: allocationIds.get(row.task_id),
        item_description: row.item_description,
        quantity: row.quantity ?? 1,
        unit_rate_cents: row.unit_rate ?? row.amount,
        amount_cents: row.amount,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })
    }
  }

  const payableLines = Map.groupBy(
    data.payable_expense_lines,
    (row) => row.expense_id
  )
  const payables = data.payable_expenses.map((row) => {
    const lines = payableLines.get(row.id) ?? []
    const title =
      row.receipt_number ??
      row.vendor_reference ??
      lines[0]?.description ??
      `Legacy payable ${row.id}`
    return {
      id: payableIds.get(row.id),
      organization_id: row.organization_id,
      project_id: projectIds.get(row.project_id),
      supplier_id: supplierIds.get(row.supplier_id),
      title,
      description: lines.map((line) => line.description).join("; ") || null,
      amount_cents: row.gross_amount,
      currency: row.currency,
      due_date: row.due_date,
      status: normalizePayableStatus(row.lifecycle_status),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  })

  const paymentAllocations = Map.groupBy(
    data.ledger_payment_allocations,
    (row) => row.payment_id
  )
  const ledgerPayments = data.ledger_payments.map((row) => {
    const allocationsForPayment = paymentAllocations.get(row.id) ?? []
    if (allocationsForPayment.length !== 1) {
      throw new Error(
        `Payment ${row.id} has ${allocationsForPayment.length} allocations; target supports one payable per payment`
      )
    }
    return {
      id: legacyId("ledger-payment", row.id),
      expense_id: null,
      organization_id: row.organization_id,
      payable_id: payableIds.get(allocationsForPayment[0].expense_id),
      supplier_id: supplierIds.get(row.supplier_id),
      amount_cents: row.amount,
      currency: row.currency,
      payment_date: row.payment_date,
      method: row.method,
      reference: row.reference,
      idempotency_key: row.idempotency_key,
      created_at: row.created_at,
      updated_at: row.created_at,
    }
  })

  return {
    organizationOwner,
    projectIds,
    projects,
    allocations,
    suppliers,
    expenses,
    expenseLines,
    payables,
    ledgerPayments,
  }
}

async function main() {
  await source.connect()
  await target.connect()
  const data = await getSourceData()
  const migration = buildMigration(data)

  const summary = {
    projects: migration.projects.length,
    allocations: migration.allocations.length,
    suppliers: migration.suppliers.length,
    expenses: migration.expenses.length,
    expenseLines: migration.expenseLines.length,
    payables: migration.payables.length,
    ledgerPayments: migration.ledgerPayments.length,
    uploadedFiles: data.uploaded_files.length,
  }
  console.log(`${apply ? "APPLY" : "DRY RUN"}: ${JSON.stringify(summary)}`)
  if (!apply) return

  await target.query("BEGIN")
  try {
    await target.query("SELECT pg_advisory_xact_lock(9426020718)")
    await target.query(`TRUNCATE TABLE
      audit_event, member_project, invitation, project_attachment, expense_line,
      ledger_payment, payable, expense, allocation, supplier_category, supplier,
      uploaded_file, project, account, session, verification, member, organization, "user"
      RESTART IDENTITY CASCADE`)

    const identityCounts = {}
    for (const table of [
      "user",
      "organization",
      "member",
      "account",
      "session",
      "verification",
    ]) {
      identityCounts[table] = await copyCompatibleTable(table)
    }

    const members = await readTable(source, "member")
    for (const member of members) {
      if (!migration.organizationOwner.has(member.organization_id)) {
        migration.organizationOwner.set(member.organization_id, member.user_id)
      }
    }

    for (const row of migration.projects)
      await insertRow(target, "project", row)
    for (const row of migration.allocations)
      await insertRow(target, "allocation", row)
    for (const row of migration.suppliers)
      await insertRow(target, "supplier", row)

    for (const row of data.uploaded_files) {
      const uploaderId = migration.organizationOwner.get(row.organization_id)
      if (!uploaderId)
        throw new Error(
          `No uploader found for organization ${row.organization_id}`
        )
      await insertRow(target, "uploaded_file", {
        id: row.id,
        organization_id: row.organization_id,
        uploader_id: uploaderId,
        key: `legacy/${row.id}/${row.filename}`,
        url: row.url,
        filename: row.filename,
        content_type: row.content_type,
        size_bytes: row.size_bytes,
        purpose: row.purpose,
        status: row.completed ? "completed" : "pending",
        created_at: row.created_at,
        updated_at: row.created_at,
      })
      if (row.project_id != null && row.purpose === "project_attachment") {
        await insertRow(target, "project_attachment", {
          id: legacyId("project-attachment", row.id),
          organization_id: row.organization_id,
          project_id: migration.projectIds.get(row.project_id),
          file_id: row.id,
          created_at: row.created_at,
        })
      }
    }

    for (const row of migration.expenses)
      await insertRow(target, "expense", row)
    for (const row of migration.expenseLines)
      await insertRow(target, "expense_line", row)
    for (const row of migration.payables)
      await insertRow(target, "payable", row)
    for (const row of migration.ledgerPayments)
      await insertRow(target, "ledger_payment", row)

    const checks = await target.query(`
      SELECT
        (SELECT count(*)::int FROM project) projects,
        (SELECT count(*)::int FROM allocation) allocations,
        (SELECT count(*)::int FROM supplier) suppliers,
        (SELECT count(*)::int FROM expense) expenses,
        (SELECT count(*)::int FROM expense_line) expense_lines,
        (SELECT count(*)::int FROM payable) payables,
        (SELECT count(*)::int FROM ledger_payment) ledger_payments,
        (SELECT count(*)::int FROM uploaded_file) uploaded_files`)
    const actual = checks.rows[0]
    const expected = {
      projects: summary.projects,
      allocations: summary.allocations,
      suppliers: summary.suppliers,
      expenses: summary.expenses,
      expense_lines: summary.expenseLines,
      payables: summary.payables,
      ledger_payments: summary.ledgerPayments,
      uploaded_files: summary.uploadedFiles,
    }
    for (const [key, value] of Object.entries(expected)) {
      if (actual[key] !== value)
        throw new Error(
          `Count mismatch for ${key}: expected ${value}, got ${actual[key]}`
        )
    }
    await target.query("COMMIT")
    console.log(
      `COMMITTED: identities=${JSON.stringify(identityCounts)} data=${JSON.stringify(actual)}`
    )
  } catch (error) {
    await target.query("ROLLBACK")
    throw error
  }
}

try {
  await main()
} finally {
  await source.end().catch(() => {})
  await target.end().catch(() => {})
}
