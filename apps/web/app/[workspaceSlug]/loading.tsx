import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function WorkspaceLoading() {
  return (
    <main aria-busy="true" aria-label="Loading workspace">
      <DashboardPageSkeleton />
    </main>
  )
}
