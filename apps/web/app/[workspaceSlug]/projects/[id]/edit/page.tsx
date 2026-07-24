import { notFound } from "next/navigation"
import { ProjectEditForm } from "@/components/projects/project-edit-form"
import { getProjectDetail } from "@/core/projects/service"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectDetail(id)
  if (!project) notFound()
  return <ProjectEditForm project={project} />
}
