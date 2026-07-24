import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { AdminTable, type AdminTableColumn } from "@/components/admin-table"
import { OrganizationStatusSelect } from "@/components/org-status-select"
import { PageHeader } from "@/components/page-header"
import { listOrganizations } from "@/core/organizations/service"

type OrgRow = {
  id: string
  name: string
  status: string
  userCount: number
  projectCount: number
  createdAt: Date
}

export default async function OrganizationsPage() {
  const organizations = await listOrganizations()

  const columns: AdminTableColumn<OrgRow>[] = [
    {
      key: "name",
      label: "Organization",
      searchableText: (r) => r.name,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <OrganizationStatusSelect
          organizationId={r.id}
          currentStatus={r.status}
        />
      ),
    },
    {
      key: "users",
      label: "Users",
      render: (r) => r.userCount,
    },
    {
      key: "projects",
      label: "Projects",
      render: (r) => r.projectCount,
    },
    {
      key: "created",
      label: "Created",
      render: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (r) => (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/organizations/${r.id}`}>View</Link>
        </Button>
      ),
    },
  ]

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader
        title="Organizations"
        description="Manage all tenant organizations on the platform."
      />
      <AdminTable
        columns={columns}
        rows={organizations as OrgRow[]}
        searchPlaceholder="Search organizations…"
        statusFilter={{
          options: ["active", "trial", "suspended", "pending_approval"],
          getValue: (r) => (r as OrgRow).status,
        }}
        getRowHref={(r) => `/organizations/${r.id}`}
        emptyMessage="No organizations found."
      />
    </div>
  )
}
