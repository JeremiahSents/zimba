import { Skeleton } from "@workspace/ui/components/skeleton"

// No bones here: the route is keyed by a single-use invite token, so there is no
// stable URL for the CLI to capture. Static placeholder only.
export default function InvitationLoading() {
  return (
    <main aria-busy="true" aria-label="Loading invitation" className="p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-4 h-5 w-80" />
      <Skeleton className="mt-8 h-10 w-40" />
    </main>
  )
}
