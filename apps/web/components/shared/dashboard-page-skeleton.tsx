import { Skeleton } from "@workspace/ui/components/skeleton"

const metricSlots = ["metric-1", "metric-2", "metric-3", "metric-4"]
const headerSlots = ["header-1", "header-2", "header-3", "header-4"]
const rowSlots = ["row-1", "row-2", "row-3", "row-4", "row-5"]

export function DashboardPageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="grid gap-6 md:gap-8">
      <span className="sr-only">Loading dashboard content</span>

      <div className="flex items-end justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-72 max-w-[70vw]" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {metricSlots.map((slot) => (
          <div key={slot} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="size-4 rounded-md" />
            </div>
            <Skeleton className="mt-5 h-6 w-20" />
            <Skeleton className="mt-3 h-4 w-28 rounded-md" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b p-5">
          <div className="grid gap-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <div className="space-y-4 p-5">
          <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
          <div className="hidden grid-cols-[1.2fr_0.9fr_0.9fr_0.7fr] gap-6 border-b pb-3 md:grid">
            {headerSlots.map((slot) => (
              <Skeleton key={slot} className="h-3 w-20" />
            ))}
          </div>
          {rowSlots.map((slot) => (
            <div
              key={slot}
              className="grid gap-3 border-border/70 border-b pb-4 last:border-0 md:grid-cols-[1.2fr_0.9fr_0.9fr_0.7fr] md:items-center md:gap-6"
            >
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
