import { BoneSkeleton } from "@workspace/ui/components/bones"
import { DashboardPageSkeleton } from "@/components/shared/dashboard-page-skeleton"

export default function ExpensesLoading() {
  return (
    <BoneSkeleton name="web-expenses" label="Loading expenses">
      <DashboardPageSkeleton />
    </BoneSkeleton>
  )
}
