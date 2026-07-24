import { BanknoteIcon, Building03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { listPlatformPayments } from "@/core/finance/service"

function formatCurrencyTotals(
  rows: Array<{ amountCents: number; currency: string | null }>
) {
  const totals = new Map<string, number>()
  for (const row of rows) {
    const currency = row.currency || "UGX"
    totals.set(currency, (totals.get(currency) ?? 0) + row.amountCents)
  }

  const formatted = [...totals.entries()].map(([currency, amountCents]) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amountCents / 100)
  )

  if (formatted.length === 0) return "0"
  if (formatted.length <= 2) return formatted.join(" / ")
  return `${formatted[0]} + ${formatted.length - 1} more`
}

export default async function PaymentsPage() {
  const payments = await listPlatformPayments()

  const methodCount = new Set(payments.map((p) => p.method).filter(Boolean))
    .size

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader
        title="Payments"
        description="Platform-wide payment monitoring."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Payments"
          value={payments.length}
          icon={
            <HugeiconsIcon
              icon={BanknoteIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Payment Methods"
          value={methodCount}
          icon={
            <HugeiconsIcon
              icon={Building03Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Total Amount"
          value={formatCurrencyTotals(payments)}
          icon={
            <HugeiconsIcon
              icon={BanknoteIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Organizations"
          value={new Set(payments.map((p) => p.organizationName)).size}
          icon={
            <HugeiconsIcon
              icon={Building03Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.organizationName}
                  </TableCell>
                  <TableCell>{p.supplierName}</TableCell>
                  <TableCell className="capitalize">
                    {p.method || "-"}
                  </TableCell>
                  <TableCell>{p.reference || "-"}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: p.currency || "USD",
                    }).format(p.amountCents / 100)}
                  </TableCell>
                  <TableCell>
                    {p.paymentDate
                      ? new Date(p.paymentDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
