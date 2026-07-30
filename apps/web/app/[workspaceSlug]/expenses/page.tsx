import { BoneCapture } from "@workspace/ui/components/bones"
import type { Metadata } from "next"

import { ExpensesPage } from "@/components/expenses/expenses-page"
import { getDashboardOverviewData } from "@/core/dashboard/service"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Expenses | Zimba" }

export default async function Page() {
  return (
    <BoneCapture name="web-expenses">
      <ExpensesPage data={await getDashboardOverviewData()} />
    </BoneCapture>
  )
}
