import { PageHeader } from "../../../components/page-header"
import { StatusBadge } from "../../../components/status-badge"
import { getOrganizationDetail } from "../../../core/services/organizations"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const org = await getOrganizationDetail(id)

  if (!org) {
    notFound()
  }

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader 
        title={org.name} 
        description={`Organization details and statistics.`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={org.status} />
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(org.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Base Currency</span>
              <span>{org.baseCurrency}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Users</span>
              <span>{org.members.length}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Projects</span>
              <span>{org.projects.length}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Suppliers</span>
              <span>{org.suppliers.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* TODO: Add users, projects list tabs/tables here */}
    </div>
  )
}
