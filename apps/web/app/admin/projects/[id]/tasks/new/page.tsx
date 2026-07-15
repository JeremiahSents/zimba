import { notFound } from "next/navigation"
import { NewProjectTaskPage } from "@/components/projects/new-project-task-page"
import { getProjectDetail } from "@/lib/api/projects"

export const dynamic = "force-dynamic"

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ returnTo?: string }>
}) {
  const { id } = await params
  const project = await getProjectDetail(Number(id))
  if (!project) notFound()
  const { returnTo } = await searchParams
  const fallback = `/admin/projects/${project.id}/expenses/new`
  const destination = returnTo?.startsWith(fallback) ? returnTo : fallback
  return <NewProjectTaskPage project={project} returnTo={destination} />
}
