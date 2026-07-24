import { Skeleton } from "@workspace/ui/components/skeleton"

const rows = ["one", "two", "three", "four", "five"]

export default function TransfersLoading() {
  return (
    <main aria-busy="true" aria-label="Loading transfers" className="p-6">
      <Skeleton className="h-8 w-56" />
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
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="ml-auto h-5 w-16" />
          </div>
        ))}
      </div>
    </main>
  )
}
