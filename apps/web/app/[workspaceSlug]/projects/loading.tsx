import { BoneSkeleton } from "@workspace/ui/components/bones"
import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function ProjectsLoading() {
  return (
    <BoneSkeleton name="web-projects" label="Loading projects">
      <DashboardPageSkeleton />
    </BoneSkeleton>
  )
}
