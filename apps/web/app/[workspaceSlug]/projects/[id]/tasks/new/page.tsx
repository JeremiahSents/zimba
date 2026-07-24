import { notFound } from "next/navigation"
import { NewProjectTaskPage } from "@/components/projects/new-project-task-page"
import { getProjectDetail } from "@/core/projects/service"

export const dynamic = "force-dynamic"

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string; id: string }>
  searchParams: Promise<{ returnTo?: string }>
}) {
  const { workspaceSlug, id } = await params
  const project = await getProjectDetail(id)
  if (!project) notFound()
  const { returnTo } = await searchParams
  const fallback = `/${workspaceSlug}/projects/${project.id}/expenses/new`
  const destination = returnTo?.startsWith(fallback) ? returnTo : fallback
  return <NewProjectTaskPage project={project} returnTo={destination} />
}
