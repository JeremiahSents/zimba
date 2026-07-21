import { resolve } from "node:path"
import process from "node:process"
import dotenv from "dotenv"
import pg from "pg"

dotenv.config({ path: resolve(process.cwd(), ".env.local") })

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

const source = new pg.Client({ connectionString: sourceUrl })
const target = new pg.Client({ connectionString: targetUrl })

try {
  await source.connect()
  await target.connect()

  const sourceTotals = (
    await source.query(`
    SELECT
      (SELECT count(*)::int FROM projects) projects,
      (SELECT count(*)::int FROM tasks) allocations,
      (SELECT count(*)::int FROM suppliers) suppliers,
      (SELECT count(DISTINCT COALESCE(receipt_id,id))::int FROM expenses) expenses,
      (SELECT count(*)::int FROM expenses) expense_lines,
      (SELECT COALESCE(sum(amount),0)::bigint FROM expenses) expense_total,
      (SELECT count(*)::int FROM payable_expenses) payables,
      (SELECT COALESCE(sum(gross_amount),0)::bigint FROM payable_expenses) payable_total,
      (SELECT count(*)::int FROM ledger_payments) ledger_payments,
      (SELECT COALESCE(sum(amount),0)::bigint FROM ledger_payments) payment_total,
      (SELECT count(*)::int FROM uploaded_files) uploaded_files,
      (SELECT count(*)::int FROM payment_vouchers) legacy_vouchers,
      (SELECT count(*)::int FROM financial_audit_events) legacy_financial_audits,
      (SELECT count(*)::int FROM ledger_payment_reversals) legacy_reversals`)
  ).rows[0]

  const targetTotals = (
    await target.query(`
    SELECT
      (SELECT count(*)::int FROM project) projects,
      (SELECT count(*)::int FROM allocation) allocations,
      (SELECT count(*)::int FROM supplier) suppliers,
      (SELECT count(*)::int FROM expense) expenses,
      (SELECT count(*)::int FROM expense_line) expense_lines,
      (SELECT COALESCE(sum(amount_cents),0)::bigint FROM expense_line) expense_total,
      (SELECT count(*)::int FROM payable) payables,
      (SELECT COALESCE(sum(amount_cents),0)::bigint FROM payable) payable_total,
      (SELECT count(*)::int FROM ledger_payment) ledger_payments,
      (SELECT COALESCE(sum(amount_cents),0)::bigint FROM ledger_payment) payment_total,
      (SELECT count(*)::int FROM uploaded_file) uploaded_files`)
  ).rows[0]

  const comparable = [
    "projects",
    "allocations",
    "suppliers",
    "expenses",
    "expense_lines",
    "expense_total",
    "payables",
    "payable_total",
    "ledger_payments",
    "payment_total",
    "uploaded_files",
  ]
  const mismatches = comparable.filter(
    (key) => String(sourceTotals[key]) !== String(targetTotals[key])
  )

  const integrity = (
    await target.query(`
    SELECT
      (SELECT count(*)::int FROM project p LEFT JOIN organization o ON o.id=p.organization_id WHERE o.id IS NULL) orphan_projects,
      (SELECT count(*)::int FROM allocation a LEFT JOIN project p ON p.id=a.project_id WHERE p.id IS NULL) orphan_allocations,
      (SELECT count(*)::int FROM expense_line l LEFT JOIN expense e ON e.id=l.expense_id WHERE e.id IS NULL) orphan_expense_lines,
      (SELECT count(*)::int FROM ledger_payment l LEFT JOIN payable p ON p.id=l.payable_id WHERE l.payable_id IS NOT NULL AND p.id IS NULL) orphan_payments,
      (SELECT count(*)::int FROM uploaded_file f LEFT JOIN "user" u ON u.id=f.uploader_id WHERE u.id IS NULL) orphan_files,
      (SELECT count(*)::int FROM project_attachment a LEFT JOIN project p ON p.id=a.project_id WHERE p.id IS NULL) orphan_attachments`)
  ).rows[0]
  const integrityFailures = Object.entries(integrity).filter(
    ([, count]) => count !== 0
  )

  console.log(`SOURCE ${JSON.stringify(sourceTotals)}`)
  console.log(`TARGET ${JSON.stringify(targetTotals)}`)
  console.log(`INTEGRITY ${JSON.stringify(integrity)}`)
  if (mismatches.length > 0)
    throw new Error(`Source/target mismatch: ${mismatches.join(", ")}`)
  if (integrityFailures.length > 0)
    throw new Error(
      `Integrity failures: ${integrityFailures.map(([key]) => key).join(", ")}`
    )
  console.log("VALIDATION PASSED")
} finally {
  await source.end().catch(() => {})
  await target.end().catch(() => {})
}
