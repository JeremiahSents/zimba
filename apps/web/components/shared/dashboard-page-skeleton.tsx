import { Skeleton } from "@workspace/ui/components/skeleton"

const metricSlots = ["metric-1", "metric-2", "metric-3", "metric-4"]
const rowSlots = [
  { id: "row-1", nameWidth: "w-36", val1: "w-24", val2: "w-20", badgeWidth: "w-16" },
  { id: "row-2", nameWidth: "w-44", val1: "w-20", val2: "w-24", badgeWidth: "w-14" },
  { id: "row-3", nameWidth: "w-32", val1: "w-28", val2: "w-16", badgeWidth: "w-16" },
  { id: "row-4", nameWidth: "w-40", val1: "w-20", val2: "w-20", badgeWidth: "w-12" },
  { id: "row-5", nameWidth: "w-28", val1: "w-24", val2: "w-24", badgeWidth: "w-16" },
]

export function DashboardPageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="grid gap-6 md:gap-8 animate-fade-in">
      <span className="sr-only">Loading dashboard content</span>

      {/* Header Skeleton */}
      <div className="flex items-end justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-7 w-48 rounded-lg bg-muted/80" />
          <Skeleton className="h-4 w-72 max-w-[70vw] rounded-md bg-muted/60" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl bg-muted/80" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {metricSlots.map((slot) => (
          <div
            key={slot}
            className="rounded-xl border border-border bg-card p-5 shadow-xs transition-colors"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md bg-muted/70" />
              <Skeleton className="size-8 rounded-lg bg-muted/80" />
            </div>
            <Skeleton className="mt-4 h-7 w-28 rounded-md bg-muted/90" />
            <Skeleton className="mt-2 h-3.5 w-32 rounded-md bg-muted/60" />
          </div>
        ))}
      </div>

      {/* Table Card Skeleton */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between gap-4 border-b p-5">
          <div className="grid gap-2">
            <Skeleton className="h-5 w-40 rounded-md bg-muted/80" />
            <Skeleton className="h-3.5 w-60 rounded-md bg-muted/60" />
          </div>
          <Skeleton className="h-9 w-32 rounded-xl bg-muted/80" />
        </div>

        <div className="p-5 space-y-5">
          <Skeleton className="h-9 w-full max-w-sm rounded-xl bg-muted/70" />

          {/* Table Header Row */}
          <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] gap-6 border-b pb-3 md:grid">
            <Skeleton className="h-3.5 w-20 rounded-md bg-muted/70" />
            <Skeleton className="h-3.5 w-16 rounded-md bg-muted/70" />
            <Skeleton className="h-3.5 w-20 rounded-md bg-muted/70" />
            <Skeleton className="h-3.5 w-16 rounded-md bg-muted/70" />
            <Skeleton className="h-3.5 w-12 rounded-md bg-muted/70 ml-auto" />
          </div>

          {/* Table Data Rows */}
          <div className="space-y-4">
            {rowSlots.map((row) => (
              <div
                key={row.id}
                className="grid gap-3 border-b border-border/50 pb-3.5 last:border-0 md:grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] md:items-center md:gap-6"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full bg-muted/80 shrink-0" />
                  <Skeleton className={`h-4 ${row.nameWidth} rounded-md bg-muted/90`} />
                </div>
                <Skeleton className={`h-4 ${row.val1} rounded-md bg-muted/70`} />
                <Skeleton className={`h-4 ${row.val2} rounded-md bg-muted/70`} />
                <Skeleton className={`h-4 ${row.val1} rounded-md bg-muted/70`} />
                <Skeleton className={`h-6 ${row.badgeWidth} rounded-full bg-muted/80 md:ml-auto`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
