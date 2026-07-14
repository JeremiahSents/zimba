import type { Metadata } from "next"
import { ProjectDetailPageWrapper } from "@/components/projects/project-detail-page"
import { getProjectDetail } from "@/lib/api/projects"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Project detail | Zimba" }

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectDetail(Number(id))

  return <ProjectDetailPageWrapper id={Number(id)} initialProject={project} />
}
