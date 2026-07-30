import type { AdminProjectSummaryDto } from "@workspace/api"
import { ProjectsTable } from "@/components/org-detail/projects-table"

export function OrgDetailProjectsTab({
  organizationId,
  projects,
}: {
  organizationId: string
  projects: AdminProjectSummaryDto[]
}) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <section>
        <p className="mb-2 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]">
          Organization projects
        </p>
      </section>

      <ProjectsTable
        organizationId={organizationId}
        projects={projects}
        title="Projects"
      />
    </div>
  )
}
