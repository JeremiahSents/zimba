import type { SupplierReceiptStatus } from "@workspace/api"
import { StatusBadge } from "@workspace/ui/components/status-badge"
import type { ExpenseStatus } from "@/lib/types"

/**
 * One place where domain statuses pick a semantic tone, so every table in the
 * app colours the same state the same way.
 */
const expenseStatusTone = {
  Full: "success",
  Partial: "warning",
  "Not paid": "neutral",
} as const satisfies Record<
  ExpenseStatus,
  "success" | "warning" | "neutral" | "info" | "danger"
>

export function ExpenseStatusBadge({
  status,
  label,
}: {
  status: ExpenseStatus
  /** Overrides the wording; the tone still comes from `status`. */
  label?: string
}) {
  return (
    <StatusBadge tone={expenseStatusTone[status]}>
      {label ?? status}
    </StatusBadge>
  )
}

const supplierReceiptTone = {
  New: "info",
  Pending: "danger",
  Partial: "warning",
  "Paid in full": "success",
} as const satisfies Record<
  SupplierReceiptStatus,
  "success" | "warning" | "neutral" | "info" | "danger"
>

export function SupplierReceiptStatusBadge({
  status,
}: {
  status: SupplierReceiptStatus
}) {
  return <StatusBadge tone={supplierReceiptTone[status]}>{status}</StatusBadge>
}

export function ProjectHealthBadge({ status }: { status: string }) {
  return (
    <StatusBadge tone={status === "At risk" ? "warning" : "success"}>
      {status}
    </StatusBadge>
  )
}
