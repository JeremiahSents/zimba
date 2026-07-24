import { listOnboardingApplicationsUseCase } from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"
import type { Metadata } from "next"
import {
  AdminTable,
  type AdminTableColumn,
  type AdminTableRow,
} from "@/components/admin-table"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { requirePlatformSession } from "@/core/auth/service"

export const metadata: Metadata = {
  title: "Applications | Zimba Admin",
  description: "Review customer onboarding applications.",
}

export const dynamic = "force-dynamic"

type AppRow = {
  id: string
  fullName: string
  email: string
  companyName: string
  industry: string | null
  country: string | null
  status: string
  createdAt: Date
}

export default async function ApplicationsPage() {
  await requirePlatformSession()
  const applications = await listOnboardingApplicationsUseCase(apiExecutor)

  const columns: AdminTableColumn[] = [
    { key: "company", label: "Company" },
    { key: "applicant", label: "Applicant" },
    { key: "industry", label: "Industry" },
    { key: "country", label: "Country" },
    { key: "status", label: "Status" },
    { key: "submitted", label: "Submitted" },
  ]

  const rows: AdminTableRow[] = (applications as AppRow[]).map((r) => ({
    id: r.id,
    href: `/applications/${r.id}`,
    searchText: `${r.companyName} ${r.fullName} ${r.email}`,
    status: r.status,
    cells: {
      company: <span className="font-medium">{r.companyName}</span>,
      applicant: (
        <div className="flex flex-col">
          <span className="font-medium">{r.fullName}</span>
          <span className="text-muted-foreground text-xs">{r.email}</span>
        </div>
      ),
      industry: r.industry ?? "—",
      country: r.country ?? "—",
      status: <StatusBadge status={r.status} />,
      submitted: new Date(r.createdAt).toLocaleDateString(),
    },
  }))

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Onboarding Applications"
        description="Review and approve customer onboarding requests."
      />
      <AdminTable
        columns={columns}
        rows={rows}
        searchPlaceholder="Search applications…"
        statusFilter={{
          options: ["pending", "approved", "rejected"],
        }}
        emptyMessage="No applications yet."
      />
    </div>
  )
}
