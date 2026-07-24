import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import {
  AdminTable,
  type AdminTableColumn,
  type AdminTableRow,
} from "@/components/admin-table"
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

  const columns: AdminTableColumn[] = [
    { key: "name", label: "Organization" },
    { key: "status", label: "Status" },
    { key: "users", label: "Users" },
    { key: "projects", label: "Projects" },
    { key: "created", label: "Created" },
    { key: "actions", label: "", className: "text-right" },
  ]

  const rows: AdminTableRow[] = (organizations as OrgRow[]).map((r) => ({
    id: r.id,
    href: `/organizations/${r.id}`,
    searchText: r.name,
    status: r.status,
    cells: {
      name: <span className="font-medium">{r.name}</span>,
      status: (
        <OrganizationStatusSelect organizationId={r.id} currentStatus={r.status} />
      ),
      users: r.userCount,
      projects: r.projectCount,
      created: new Date(r.createdAt).toLocaleDateString(),
      actions: (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/organizations/${r.id}`}>View</Link>
        </Button>
      ),
    },
  }))

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader
        title="Organizations"
        description="Manage all tenant organizations on the platform."
      />
      <AdminTable
        columns={columns}
        rows={rows}
        searchPlaceholder="Search organizations…"
        statusFilter={{
          options: ["active", "trial", "suspended", "pending_approval"],
        }}
        emptyMessage="No organizations found."
      />
    </div>
  )
}
