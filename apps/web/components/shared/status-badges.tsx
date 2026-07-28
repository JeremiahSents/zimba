import type { SupplierReceiptStatus } from "@workspace/api"
import { Badge } from "@workspace/ui/components/badge"
import type { ExpenseStatus } from "@/lib/types"

type Tone = "success" | "warning" | "info" | "destructive" | "secondary"

/**
 * One place where domain statuses pick a `Badge` variant, so every table in the
 * app colours the same state the same way.
 */
const expenseStatusTone = {
  Full: "success",
  Partial: "warning",
  "Not paid": "secondary",
} as const satisfies Record<ExpenseStatus, Tone>

export function ExpenseStatusBadge({
  status,
  label,
}: {
  status: ExpenseStatus
  /** Overrides the wording; the variant still comes from `status`. */
  label?: string
}) {
  return <Badge variant={expenseStatusTone[status]}>{label ?? status}</Badge>
}

const supplierReceiptTone = {
  New: "info",
  Pending: "destructive",
  Partial: "warning",
  "Paid in full": "success",
} as const satisfies Record<SupplierReceiptStatus, Tone>

export function SupplierReceiptStatusBadge({
  status,
}: {
  status: SupplierReceiptStatus
}) {
  return <Badge variant={supplierReceiptTone[status]}>{status}</Badge>
}

export function ProjectHealthBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "At risk" ? "warning" : "success"}>
      {status}
    </Badge>
  )
}
