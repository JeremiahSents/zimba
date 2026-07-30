import {
  BanknoteIcon,
  FactoryIcon,
  Invoice01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { OrganizationStatusButtons } from "@/components/org-status-buttons"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { VisitOrganizationButton } from "@/components/visit-organization-button"
import { formatCompactCurrency } from "@/lib/format-currency"

type OrgStats = {
  totalSpendCents: number
  totalPaidCents: number
  expenseCount: number
  paymentCount: number
  memberCount: number
  projectCount: number
  supplierCount: number
}

type Member = {
  id: string
  role: string
  responsibility: string | null
  createdAt: Date
  user: { name: string; email: string; image?: string | null }
}

type Org = {
  id: string
  name: string
  slug: string
  status: string
  currency: string
  createdAt: Date
  members: Member[]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

function formatDate(dateInput: Date | string) {
  const d = new Date(dateInput)
  const day = d.getDate()
  const month = d.toLocaleDateString("en-US", { month: "long" })
  const year = d.getFullYear()
  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
}

export function OrgDetailOverviewTab({
  org,
  stats,
  isSuperAdmin,
}: {
  org: Org
  stats: OrgStats
  isSuperAdmin: boolean
}) {
  const ownerMember =
    org.members.find((m) => m.role.toLowerCase() === "owner") ||
    org.members.find((m) => m.role.toLowerCase() === "admin") ||
    org.members[0]
  const ownerUser = ownerMember?.user

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* ── Owner Details Banner ── */}
      {ownerUser ? (
        <Card className="overflow-hidden border bg-gradient-to-r from-card via-card to-muted/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Organization Owner
              </CardTitle>
              <Badge variant="secondary" className="text-xs capitalize">
                {ownerMember.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Avatar className="size-14 border-2 border-primary/20 shadow-xs">
                {ownerUser.image ? (
                  <AvatarImage src={ownerUser.image} alt={ownerUser.name} />
                ) : null}
                <AvatarFallback className="bg-primary font-semibold text-lg text-primary-foreground">
                  {getInitials(ownerUser.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-48 flex-1 space-y-1">
                <h3 className="font-heading font-semibold text-lg leading-tight">
                  {ownerUser.name}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {ownerUser.email}
                </p>
              </div>

              <div className="flex items-center gap-6 border-l pl-6 text-muted-foreground text-xs">
                <div>
                  <span className="block font-medium text-foreground text-sm">
                    {formatDate(ownerMember.createdAt)}
                  </span>
                  <span>Joined Date</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* ── Financial & Platform Stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Spend"
          value={formatCompactCurrency(stats.totalSpendCents, org.currency)}
          icon={
            <HugeiconsIcon
              icon={BanknoteIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${stats.expenseCount} receipts logged`}
        />
        <StatCard
          title="Total Paid"
          value={formatCompactCurrency(stats.totalPaidCents, org.currency)}
          icon={
            <HugeiconsIcon
              icon={Invoice01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${stats.paymentCount} completed payments`}
        />
        <StatCard
          title="Team Members"
          value={stats.memberCount}
          icon={
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${org.members.length} registered members`}
        />
        <StatCard
          title="Projects & Suppliers"
          value={`${stats.projectCount} / ${stats.supplierCount}`}
          icon={
            <HugeiconsIcon
              icon={FactoryIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${stats.projectCount} projects · ${stats.supplierCount} suppliers`}
        />
      </div>

      {/* ── Status Actions ── */}
      <div className="flex flex-wrap items-center gap-2">
        {isSuperAdmin && <VisitOrganizationButton organizationId={org.id} />}
        <OrganizationStatusButtons
          organizationId={org.id}
          currentStatus={org.status}
        />
      </div>

      {/* ── Profile Specifications ── */}
      <Card>
        <CardHeader>
          <CardTitle className="font-semibold text-base">
            Profile Specifications
          </CardTitle>
          <CardDescription>
            Technical metadata and configuration details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between border-b pb-3">
            <span className="text-muted-foreground">Slug</span>
            <span className="font-mono text-xs">{org.slug}</span>
          </div>
          <div className="flex justify-between border-b pb-3">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={org.status} />
          </div>
          <div className="flex justify-between border-b pb-3">
            <span className="text-muted-foreground">Base Currency</span>
            <span className="font-semibold">{org.currency}</span>
          </div>
          <div className="flex justify-between border-b pb-3">
            <span className="text-muted-foreground">Created Date</span>
            <span>{formatDate(org.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
