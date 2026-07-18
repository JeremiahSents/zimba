import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProjectFilesPage } from "@/components/projects/project-files-page"
import { getProjectDetail } from "@/core/projects/service"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Project files | Zimba" }

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectDetail(id)
  if (!project) notFound()
  return <ProjectFilesPage project={project} />
}
