import { PageHeader } from "../../components/page-header"
import { listPlatformPayments } from "../../core/services/financials"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@workspace/ui/components/table"

export default async function PaymentsPage() {
  const payments = await listPlatformPayments()

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader 
        title="Payments" 
        description="Platform-wide payment monitoring."
      />

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
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.organizationName}</TableCell>
                  <TableCell>{p.supplierName}</TableCell>
                  <TableCell className="capitalize">{p.method || "-"}</TableCell>
                  <TableCell>{p.reference || "-"}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency || 'USD' }).format(p.amountCents / 100)}
                  </TableCell>
                  <TableCell>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
