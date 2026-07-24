import { Skeleton } from "@workspace/ui/components/skeleton"

const rows = ["one", "two", "three", "four", "five"]

export default function SuppliersLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading suppliers"
      className="flex-1 p-6 lg:p-8"
    >
      <Skeleton className="h-8 w-48" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {rows.slice(0, 4).map((key) => (
          <Skeleton key={key} className="h-24 w-full" />
        ))}
      </div>
      <div className="mt-6 rounded-lg border">
        {rows.map((row) => (
          <div
            key={row}
            className="flex items-center gap-4 border-b p-3 last:border-0"
          >
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-28" />
          </div>
        ))}
      </div>
    </main>
  )
}
