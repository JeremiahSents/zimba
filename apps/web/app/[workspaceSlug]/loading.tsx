import { Skeleton } from "@workspace/ui/components/skeleton"

export default function WorkspaceLoading() {
  return (
    <main aria-busy="true" aria-label="Loading workspace">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-6 h-32 w-full" />
    </main>
  )
}
