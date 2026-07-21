import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { PageHeader } from "@/components/page-header"
import { listPlatformAuditLogs } from "@/core/services/audit"

export default async function ActivityPage() {
  const logs = await listPlatformAuditLogs()

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader
        title="Activity Log"
        description="Platform-wide audit and activity events."
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Organization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No activity found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{log.actorName}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 font-medium text-xs ring-1 ring-muted-foreground/20 ring-inset">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">
                    {log.entityType} ({log.entityId.substring(0, 8)}...)
                  </TableCell>
                  <TableCell>{log.organizationName}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
