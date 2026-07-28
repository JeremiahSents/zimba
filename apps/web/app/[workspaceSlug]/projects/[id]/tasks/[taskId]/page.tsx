import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProjectTaskPage } from "@/components/projects/project-task-page"
import { getProjectDetail } from "@/core/projects/service"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Task detail | Zimba" }

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>
}) {
  const { id, taskId } = await params
  const project = await getProjectDetail(id)
  if (!project) notFound()
  if (!project.tasks.some((task) => task.id === taskId)) notFound()

  return <ProjectTaskPage project={project} taskId={taskId} />
}
