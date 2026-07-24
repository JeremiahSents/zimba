import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function ProjectsLoading() {
  return (
    <main aria-busy="true" aria-label="Loading projects">
      <DashboardPageSkeleton />
    </main>
  )
}
