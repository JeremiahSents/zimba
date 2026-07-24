import { Building03Icon, FileCheckIcon } from "@hugeicons/core-free-icons"
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
import { StatusBadge } from "@/components/status-badge"
import { listPlatformReceipts } from "@/core/finance/service"

export default async function ReceiptsPage() {
  const receipts = await listPlatformReceipts()

  const paidCount = receipts.filter((r) => r.paymentStatus === "paid").length
  const pendingCount = receipts.filter(
    (r) => r.paymentStatus === "pending" || r.paymentStatus === "unpaid"
  ).length

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader
        title="Receipts"
        description="Platform-wide receipt monitoring."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Receipts"
          value={receipts.length}
          icon={
            <HugeiconsIcon
              icon={Building03Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Paid"
          value={paidCount}
          icon={
            <HugeiconsIcon
              icon={FileCheckIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Pending / Unpaid"
          value={pendingCount}
          icon={
            <HugeiconsIcon
              icon={Building03Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Organizations"
          value={new Set(receipts.map((r) => r.organizationName)).size}
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
              <TableHead>Project</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No receipts found.
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.organizationName}
                  </TableCell>
                  <TableCell>{r.projectName}</TableCell>
                  <TableCell>{r.supplierName}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    {r.expenseDate
                      ? new Date(r.expenseDate).toLocaleDateString()
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
