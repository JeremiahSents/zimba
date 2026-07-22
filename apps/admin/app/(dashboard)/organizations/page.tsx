import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import Link from "next/link"
import { OrganizationStatusSelect } from "@/components/org-status-select"
import { PageHeader } from "@/components/page-header"
import { listOrganizations } from "@/core/organizations/service"

export default async function OrganizationsPage() {
  const organizations = await listOrganizations()

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader
        title="Organizations"
        description="Manage all tenant organizations on the platform."
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No organizations found.
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>
                    <OrganizationStatusSelect
                      organizationId={org.id}
                      currentStatus={org.status}
                    />
                  </TableCell>
                  <TableCell>{org.userCount}</TableCell>
                  <TableCell>{org.projectCount}</TableCell>
                  <TableCell>
                    {new Date(org.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/organizations/${org.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
