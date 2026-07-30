import { AppSkeleton } from "@workspace/ui/components/skeleton"
import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function ExpensesLoading() {
  return (
    <main aria-busy="true" aria-label="Loading expenses">
      <AppSkeleton name="web-expenses">
        <DashboardPageSkeleton />
      </AppSkeleton>
    </main>
  )
}
