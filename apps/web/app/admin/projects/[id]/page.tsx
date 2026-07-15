import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProjectDetailPageWrapper } from "@/components/projects/project-detail-page"
import { getDataMode } from "@/lib/api/data-mode"
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
  if (!project) notFound()

  return (
    <ProjectDetailPageWrapper
      initialProject={project}
      source={getDataMode() === "mock" ? "mock" : "api"}
    />
  )
}
