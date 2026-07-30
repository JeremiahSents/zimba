import type { AdminSupplierWithStatsDto } from "@workspace/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { StatusBadge } from "@/components/status-badge"
import { formatCompactCurrency } from "@/lib/format-currency"

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

function formatDate(dateInput: Date | string) {
  const d = new Date(dateInput)
  const day = d.getDate()
  const month = d.toLocaleDateString("en-US", { month: "long" })
  const year = d.getFullYear()
  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
}

function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .replace(/\b\p{L}/gu, (match) => match.toUpperCase())
}

export function OrgDetailSuppliersTab({
  suppliers,
  currency,
}: {
  suppliers: AdminSupplierWithStatsDto[]
  currency: string
}) {
  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="font-semibold text-base">
          Organization Suppliers
        </CardTitle>
        <CardDescription>
          Registered vendors with payment history and totals.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Payments</TableHead>
              <TableHead>Total Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No suppliers registered yet.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((sup) => (
                <TableRow key={sup.id}>
                  <TableCell className="font-medium text-foreground text-sm">
                    {toTitleCase(sup.name)}
                  </TableCell>
                  <TableCell className="text-foreground/80 text-sm capitalize">
                    {toTitleCase(sup.category || "Other")}
                  </TableCell>
                  <TableCell className="text-foreground text-sm">
                    {sup.phone || sup.email || "—"}
                  </TableCell>
                  <TableCell className="tabular-nums text-foreground text-sm">
                    {sup.paymentCount}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-foreground text-sm tabular-nums">
                    {formatCompactCurrency(sup.totalPaidCents, currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sup.status} />
                  </TableCell>
                  <TableCell className="text-foreground text-sm">
                    {formatDate(sup.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
