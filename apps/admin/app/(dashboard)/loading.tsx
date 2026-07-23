import { Skeleton } from "@workspace/ui/components/skeleton"

export default function AdminLoading() {
  return (
    <main aria-busy="true" aria-label="Loading admin console">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-6 h-40 w-full" />
    </main>
  )
}
