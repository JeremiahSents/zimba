import { AppSkeleton } from "@workspace/ui/components/skeleton"
import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function HomeLoading() {
  return (
    <main aria-busy="true" aria-label="Loading dashboard">
      <AppSkeleton name="web-home">
        <DashboardPageSkeleton />
      </AppSkeleton>
    </main>
  )
}
