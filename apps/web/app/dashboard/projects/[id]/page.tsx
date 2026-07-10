import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProjectDetail } from "@/lib/zimba/project-detail-data"
import { ProjectDetailPage } from "@/components/dashboard/features/projects/project-detail-page"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Project detail | Zimba" }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProjectDetail(Number(id))
  if (!project) notFound()
  return <ProjectDetailPage project={project} />
}
