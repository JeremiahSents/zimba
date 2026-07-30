import { AppSkeleton } from "@workspace/ui/components/skeleton"
import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function ProjectsLoading() {
  return (
    <main aria-busy="true" aria-label="Loading projects">
      <AppSkeleton name="web-projects">
        <DashboardPageSkeleton />
      </AppSkeleton>
    </main>
  )
}
