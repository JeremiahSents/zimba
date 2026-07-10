import type { Metadata } from "next"

import { ProjectsPage } from "@/components/dashboard/features/projects/projects-page"
import { getDashboardOverviewData } from "@/lib/zimba/dashboard-data"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Projects | Zimba",
  description: "View construction projects, budgets, and delivery status.",
}

export default async function Page() {
  const data = await getDashboardOverviewData()

  return <ProjectsPage data={data} />
}
