import { BoneSkeleton } from "@workspace/ui/components/bones"
import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function WorkspaceLoading() {
  return (
    <BoneSkeleton name="web-shell" label="Loading workspace">
      <DashboardPageSkeleton />
    </BoneSkeleton>
  )
}
