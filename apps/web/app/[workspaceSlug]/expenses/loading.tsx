import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function ExpensesLoading() {
  return (
    <main aria-busy="true" aria-label="Loading expenses">
      <DashboardPageSkeleton />
    </main>
  )
}
