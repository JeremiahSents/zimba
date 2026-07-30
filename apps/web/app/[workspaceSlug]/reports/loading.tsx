import { AppSkeleton } from "@workspace/ui/components/skeleton"
import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function ReportsLoading() {
  return (
    <AppSkeleton name="web-reports">
      <DashboardPageSkeleton />
    </AppSkeleton>
  )
}
