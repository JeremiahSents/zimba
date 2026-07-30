import { BoneSkeleton } from "@workspace/ui/components/bones"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { AdminDashboardShell } from "@/components/dashboard-shell"

const rows = ["one", "two", "three", "four", "five", "six"]

export default function ActivityLoading() {
  return (
    <BoneSkeleton name="admin-activity" label="Loading activity log">
      <AdminDashboardShell>
        <Skeleton className="h-8 w-48" />
        <div className="rounded-lg border">
          {rows.map((row) => (
            <div
              key={row}
              className="flex items-center gap-4 border-b p-3 last:border-0"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </AdminDashboardShell>
    </BoneSkeleton>
  )
}
