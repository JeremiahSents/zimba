import { BoneCapture } from "@workspace/ui/components/bones"
import type { Metadata } from "next"

import { ProjectsPage } from "@/components/projects/projects-page"
import { getDashboardOverviewData } from "@/core/dashboard/service"
import { getArchivedProjectsList } from "@/core/projects/service"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Projects | Zimba",
  description: "View construction projects, budgets, and delivery status.",
}

export default async function Page() {
  const [data, archivedProjects] = await Promise.all([
    getDashboardOverviewData(),
    getArchivedProjectsList(),
  ])

  return (
    <BoneCapture name="web-projects">
      <ProjectsPage data={data} archivedProjects={archivedProjects} />
    </BoneCapture>
  )
}
