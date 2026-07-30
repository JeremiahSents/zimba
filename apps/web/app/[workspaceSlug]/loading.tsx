import { AppSkeleton } from "@workspace/ui/components/skeleton"
import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function WorkspaceLoading() {
  return (
    <main aria-busy="true" aria-label="Loading workspace">
      <AppSkeleton name="web-workspace">
        <DashboardPageSkeleton />
      </AppSkeleton>
    </main>
  )
}
