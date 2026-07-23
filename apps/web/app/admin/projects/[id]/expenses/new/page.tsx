import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProjectExpenseCreatePage } from "@/components/projects/project-expense-create-page"
import { getDashboardOverviewData } from "@/core/dashboard/service"
import { getProjectDetail } from "@/core/projects/service"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "New expense | Zimba" }

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [project, dashboard] = await Promise.all([
    getProjectDetail(id),
    getDashboardOverviewData(),
  ])

  if (!project) notFound()

  return (
    <ProjectExpenseCreatePage project={project} vendors={dashboard.suppliers} />
  )
}
