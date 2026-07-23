import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"
import { DashboardShell } from "@/components/shared/dashboard-shell"

export default function Loading() {
  return (
    <DashboardShell title="Loading" subtitle="">
      <DashboardPageSkeleton />
    </DashboardShell>
  )
}
