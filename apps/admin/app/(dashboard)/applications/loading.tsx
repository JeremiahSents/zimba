import { BoneSkeleton } from "@workspace/ui/components/bones"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { AdminDashboardShell } from "@/components/dashboard-shell"

const rows = ["one", "two", "three", "four", "five"]

export default function ApplicationsLoading() {
  return (
    <BoneSkeleton name="admin-applications" label="Loading applications">
      <AdminDashboardShell>
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="rounded-lg border">
          {rows.map((row) => (
            <div
              key={row}
              className="flex items-center gap-4 border-b p-3 last:border-0"
            >
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="ml-auto h-5 w-16" />
            </div>
          ))}
        </div>
      </AdminDashboardShell>
    </BoneSkeleton>
  )
}
