import { BoneSkeleton } from "@workspace/ui/components/bones"
import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function HomeLoading() {
  return (
    <BoneSkeleton name="web-home" label="Loading dashboard">
      <DashboardPageSkeleton />
    </BoneSkeleton>
  )
}
