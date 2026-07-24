import { Skeleton } from "@workspace/ui/components/skeleton"

const rows = ["one", "two", "three", "four", "five", "six"]

export default function UsersLoading() {
  return (
    <main aria-busy="true" aria-label="Loading users" className="p-6">
      <Skeleton className="h-8 w-48" />
      <div className="mt-6 flex gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="mt-4 rounded-lg border">
        {rows.map((row) => (
          <div
            key={row}
            className="flex items-center gap-4 border-b p-3 last:border-0"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="ml-auto h-8 w-16" />
          </div>
        ))}
      </div>
    </main>
  )
}
