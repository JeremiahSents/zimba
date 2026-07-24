import { Skeleton } from "@workspace/ui/components/skeleton"

const statSkeletons = ["users", "organizations", "applications", "transfers"]

export default function AdminLoading() {
  return (
    <main aria-busy="true" aria-label="Loading admin console" className="p-6">
      <Skeleton className="h-8 w-48" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statSkeletons.map((key) => (
          <Skeleton key={key} className="h-28 w-full" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </main>
  )
}
