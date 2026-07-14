import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProjectExpenseCreatePage } from "@/components/projects/project-expense-create-page"
import { getProjectDetail } from "@/lib/api/projects"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "New expense | Zimba" }

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getProjectDetail(Number(id))

  if (!project) notFound()

  return <ProjectExpenseCreatePage project={project} />
}
