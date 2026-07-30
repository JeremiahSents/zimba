import { BoneSkeleton } from "@workspace/ui/components/bones"
import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function ReportsLoading() {
  return (
    <BoneSkeleton name="web-reports" label="Loading reports">
      <DashboardPageSkeleton />
    </BoneSkeleton>
  )
}
