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

// Mock Service for Support
const mockSupportData = [
  { id: "1", organizationName: "BuildTech Inc", priority: "High", status: "needs_follow_up", lastContact: "2026-07-20", note: "Waiting for invoice approval" },
  { id: "2", organizationName: "Apex Construction", priority: "Medium", status: "watching", lastContact: "2026-07-15", note: "Monitor receipt parsing" },
  { id: "3", organizationName: "Skyline Developers", priority: "Low", status: "resolved", lastContact: "2026-07-10", note: "Onboarding complete" },
]

export default function SupportPage() {
  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader 
        title="Support & Admin Notes" 
        description="Internal tracking of tenant issues and operations."
      />

      <div className="mb-6 rounded-md border border-muted-foreground/20 bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Placeholder Data</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Support ticketing and internal notes schema is not yet available in the database. This data is mocked.
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Latest Note</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSupportData.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.organizationName}</TableCell>
                <TableCell>{s.priority}</TableCell>
                <TableCell>
                  <StatusBadge 
                    status={s.status.replace("_", " ")} 
                  />
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[250px] truncate" title={s.note}>
                  {s.note}
                </TableCell>
                <TableCell>{s.lastContact}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Update</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
