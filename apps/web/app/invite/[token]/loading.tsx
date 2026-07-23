import { Skeleton } from "@workspace/ui/components/skeleton"

export default function InvitationLoading() {
  return (
    <main aria-busy="true" aria-label="Loading invitation">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-4 h-5 w-80" />
      <Skeleton className="mt-8 h-10 w-40" />
    </main>
  )
}
