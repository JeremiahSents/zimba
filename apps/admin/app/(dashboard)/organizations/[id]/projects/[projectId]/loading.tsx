import { BoneSkeleton } from "@workspace/ui/components/bones"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { AdminDashboardShell } from "@/components/dashboard-shell"

const rows = ["one", "two", "three", "four"]

export default function ProjectDetailLoading() {
  return (
    <BoneSkeleton name="admin-project-detail" label="Loading project">
      <AdminDashboardShell>
        <div className="flex items-center gap-3 border-b pb-4">
          <Skeleton className="size-8 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {rows.map((row) => (
            <Skeleton key={row} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </AdminDashboardShell>
    </BoneSkeleton>
  )
}
