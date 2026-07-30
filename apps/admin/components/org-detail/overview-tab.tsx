import type {
  AdminProjectSummaryDto,
  AdminSupplierWithStatsDto,
} from "@workspace/api"
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
import { Progress } from "@workspace/ui/components/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  BanknoteIcon,
  FactoryIcon,
  Invoice01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { StatCard } from "@/components/stat-card"
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

function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

export function OrgDetailOverviewTab({
  org,
  stats,
  projects,
  suppliers,
}: {
  org: Org
  stats: OrgStats
  projects: AdminProjectSummaryDto[]
  suppliers: AdminSupplierWithStatsDto[]
}) {
  const ownerMember =
    org.members.find((m) => m.role.toLowerCase() === "owner") ||
    org.members.find((m) => m.role.toLowerCase() === "admin") ||
    org.members[0]
  const ownerUser = ownerMember?.user

  const totalBudgetCents = projects.reduce(
    (sum, project) => sum + project.budgetCents,
    0
  )
  const utilization = totalBudgetCents
    ? (stats.totalSpendCents / totalBudgetCents) * 100
    : 0
  const topProjects = [...projects]
    .sort((a, b) => b.spentCents - a.spentCents)
    .slice(0, 4)
  const topSuppliers = [...suppliers]
    .sort((a, b) => b.totalPaidCents - a.totalPaidCents)
    .slice(0, 4)

  return (
    <div className="mt-4 flex flex-col gap-4">
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

      <section className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]">
            Organization analytics
          </p>
          <h2 className="font-heading font-semibold text-xl tracking-tight">
            Spend health and portfolio mix
          </h2>
          <p className="mt-2 text-muted-foreground text-xs">
            Compare project spend, supplier payments, and overall budget
            utilization for this organization.
          </p>
        </div>
      </section>

      <Card className="gap-0 py-0">
        <div className="grid grid-cols-2 sm:grid-cols-3">
          {[
            ["Portfolio budget", formatCompactCurrency(totalBudgetCents, org.currency)],
            ["Spent to date", formatCompactCurrency(stats.totalSpendCents, org.currency)],
            ["Budget used", formatPercent(utilization)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-t p-5 first:border-t-0 sm:border-t-0 sm:border-l sm:first:border-l-0"
            >
              <p className="font-medium text-muted-foreground text-xs">
                {label}
              </p>
              <p className="mt-4 font-heading font-semibold text-base tracking-tight">
                {value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-semibold text-base">
              Project spend
            </CardTitle>
            <CardDescription>
              Top projects by actual spend and utilization.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProjects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No project analytics yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  topProjects.map((project) => {
                    const pct = project.budgetCents
                      ? Math.min(
                          100,
                          Math.round(
                            (project.spentCents / project.budgetCents) * 100
                          )
                        )
                      : 0
                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium text-foreground text-sm">
                          {project.name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
                          {formatCompactCurrency(project.budgetCents, org.currency)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
                          {formatCompactCurrency(project.spentCents, org.currency)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress value={pct} className="w-24 shrink-0" />
                            <span className="text-sm tabular-nums">{pct}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-semibold text-base">
              Supplier payments
            </CardTitle>
            <CardDescription>
              Suppliers ranked by total paid amount.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Payments</TableHead>
                  <TableHead>Total Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No supplier payments recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  topSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium text-foreground text-sm">
                        {supplier.name}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums text-muted-foreground">
                        {supplier.paymentCount}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
                        {formatCompactCurrency(
                          supplier.totalPaidCents,
                          org.currency
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
