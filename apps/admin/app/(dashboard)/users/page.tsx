import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import { AdminTable, type AdminTableColumn } from "@/components/admin-table"
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

  const columns: AdminTableColumn<UserRow>[] = [
    {
      key: "name",
      label: "User",
      searchableText: (r) => `${r.name} ${r.email}`,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "email",
      label: "Email",
      searchableText: (r) => r.email,
      render: (r) => r.email,
    },
    {
      key: "role",
      label: "Platform Role",
      render: (r) =>
        r.platformRole ? (
          <Badge variant="secondary">{r.platformRole}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">User</span>
        ),
    },
    {
      key: "org",
      label: "Primary Org",
      render: (r) => r.primaryOrganization ?? "—",
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
          <Link href={`/users/${r.id}`}>View</Link>
        </Button>
      ),
    },
  ]

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader title="Users" description="Platform-wide user management." />
      <AdminTable
        columns={columns}
        rows={users as UserRow[]}
        searchPlaceholder="Search users…"
        statusFilter={{
          options: ["super_admin", "support", "none"],
          getValue: (r) => (r as UserRow).platformRole ?? "none",
        }}
        getRowHref={(r) => `/users/${r.id}`}
        emptyMessage="No users found."
      />
    </div>
  )
}
