import { PageHeader } from "../../components/page-header"
import { StatusBadge } from "../../components/status-badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@workspace/ui/components/table"
import { Button } from "@workspace/ui/components/button"

// Mock Service for Billing
const mockBillingData = [
  { id: "1", organizationName: "BuildTech Inc", plan: "Pro", status: "active", mrr: 15000, nextBilling: "2026-08-01" },
  { id: "2", organizationName: "Apex Construction", plan: "Enterprise", status: "failed", mrr: 45000, nextBilling: "2026-07-15" },
  { id: "3", organizationName: "Skyline Developers", plan: "Starter", status: "trial", mrr: 5000, nextBilling: "2026-08-10" },
  { id: "4", organizationName: "Urban Projects", plan: "Pro", status: "suspended", mrr: 0, nextBilling: "-" },
]

export default function BillingPage() {
  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader 
        title="Billing & Plans" 
        description="Monitor subscriptions, MRR, and payment health."
      />

      <div className="mb-6 rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Placeholder Data</h3>
        </div>
        <p className="mt-2 text-sm">
          Real Stripe billing integration is not yet connected to the platform database. This data is mocked.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>MRR</TableHead>
              <TableHead>Next Billing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockBillingData.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.organizationName}</TableCell>
                <TableCell>{b.plan}</TableCell>
                <TableCell><StatusBadge status={b.status} /></TableCell>
                <TableCell>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(b.mrr / 100)}
                </TableCell>
                <TableCell>{b.nextBilling}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Manage</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
