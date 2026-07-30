import { BoneSkeleton } from "@workspace/ui/components/bones"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { AdminDashboardShell } from "@/components/dashboard-shell"

const rows = ["one", "two", "three", "four", "five"]

export default function PaymentsLoading() {
  return (
    <BoneSkeleton name="admin-payments" label="Loading payments">
      <AdminDashboardShell>
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {rows.slice(0, 4).map((key) => (
            <Skeleton key={key} className="h-24 w-full" />
          ))}
        </div>
        <div className="rounded-lg border">
          {rows.map((row) => (
            <div
              key={row}
              className="flex items-center gap-4 border-b p-3 last:border-0"
            >
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </AdminDashboardShell>
    </BoneSkeleton>
  )
}
