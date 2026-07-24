import { listOnboardingApplicationsUseCase } from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"
import type { Metadata } from "next"
import { AdminTable, type AdminTableColumn } from "@/components/admin-table"
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

  const columns: AdminTableColumn<AppRow>[] = [
    {
      key: "company",
      label: "Company",
      searchableText: (r) => r.companyName,
      render: (r) => <span className="font-medium">{r.companyName}</span>,
    },
    {
      key: "applicant",
      label: "Applicant",
      searchableText: (r) => `${r.fullName} ${r.email}`,
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.fullName}</span>
          <span className="text-muted-foreground text-xs">{r.email}</span>
        </div>
      ),
    },
    {
      key: "industry",
      label: "Industry",
      render: (r) => r.industry ?? "—",
    },
    {
      key: "country",
      label: "Country",
      render: (r) => r.country ?? "—",
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "submitted",
      label: "Submitted",
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Onboarding Applications"
        description="Review and approve customer onboarding requests."
      />
      <AdminTable
        columns={columns}
        rows={applications as AppRow[]}
        searchPlaceholder="Search applications…"
        statusFilter={{
          options: ["pending", "approved", "rejected"],
          getValue: (r) => (r as AppRow).status,
        }}
        getRowHref={(r) => `/applications/${r.id}`}
        emptyMessage="No applications yet."
      />
    </div>
  )
}
