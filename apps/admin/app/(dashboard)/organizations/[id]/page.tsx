import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { notFound } from "next/navigation"
import { OrganizationStatusButtons } from "@/components/org-status-buttons"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import {
  getOrganizationDetail,
  getOrganizationStats,
} from "@/core/organizations/service"

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [org, stats] = await Promise.all([
    getOrganizationDetail(id),
    getOrganizationStats(id),
  ])

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
              <div className="flex items-center gap-2">
                <StatusBadge status={org.status} />
                <OrganizationStatusButtons
                  organizationId={org.id}
                  currentStatus={org.status}
                />
              </div>
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
              <span>{stats.memberCount}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Projects</span>
              <span>{stats.projectCount}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Suppliers</span>
              <span>{stats.supplierCount}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Receipts</span>
              <span>{stats.expenseCount}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Spend</span>
              <span>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: org.baseCurrency,
                }).format(stats.totalSpendCents / 100)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Paid</span>
              <span>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: org.baseCurrency,
                }).format(stats.totalPaidCents / 100)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TODO: Add users, projects list tabs/tables here */}
    </div>
  )
}
