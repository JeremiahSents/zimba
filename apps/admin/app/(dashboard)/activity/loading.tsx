import { Skeleton } from "@workspace/ui/components/skeleton"

const rows = ["one", "two", "three", "four", "five", "six"]

export default function ActivityLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading activity log"
      className="flex-1 p-6 lg:p-8"
    >
      <Skeleton className="h-8 w-48" />
      <div className="mt-6 rounded-lg border">
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
    </main>
  )
}
