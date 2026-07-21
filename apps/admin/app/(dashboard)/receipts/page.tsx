import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { listPlatformReceipts } from "@/core/services/financials"

export default async function ReceiptsPage() {
  const receipts = await listPlatformReceipts()

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader
        title="Receipts"
        description="Platform-wide receipt monitoring."
      />

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
