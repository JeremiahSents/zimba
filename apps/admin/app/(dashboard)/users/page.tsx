import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import {
  AdminTable,
  type AdminTableColumn,
  type AdminTableRow,
} from "@/components/admin-table"
import { PageHeader } from "@/components/page-header"
import { listPlatformUsers } from "@/core/users/service"

type UserRow = {
  id: string
  name: string
  email: string
  platformRole: string | null
  primaryOrganization: string | null
  createdAt: Date
}

export default async function UsersPage() {
  const users = await listPlatformUsers()

  const columns: AdminTableColumn[] = [
    { key: "name", label: "User" },
    { key: "email", label: "Email" },
    { key: "role", label: "Platform Role" },
    { key: "org", label: "Primary Org" },
    { key: "created", label: "Created" },
    { key: "actions", label: "", className: "text-right" },
  ]

  const rows: AdminTableRow[] = (users as UserRow[]).map((r) => ({
    id: r.id,
    href: `/users/${r.id}`,
    searchText: `${r.name} ${r.email}`,
    status: r.platformRole ?? "none",
    cells: {
      name: <span className="font-medium">{r.name}</span>,
      email: r.email,
      role: r.platformRole ? (
        <Badge variant="secondary">{r.platformRole}</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">User</span>
      ),
      org: r.primaryOrganization ?? "—",
      created: new Date(r.createdAt).toLocaleDateString(),
      actions: (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/users/${r.id}`}>View</Link>
        </Button>
      ),
    },
  }))

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader title="Users" description="Platform-wide user management." />
      <AdminTable
        columns={columns}
        rows={rows}
        searchPlaceholder="Search users…"
        statusFilter={{
          options: ["super_admin", "support", "none"],
        }}
        emptyMessage="No users found."
      />
    </div>
  )
}
