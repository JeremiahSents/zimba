import {
  ArrowLeft02Icon,
  BanknoteIcon,
  Building03Icon,
  FactoryIcon,
  Invoice01Icon,
  Mail01Icon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { OrganizationStatusButtons } from "@/components/org-status-buttons"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import {
  getOrganizationDetail,
  getOrganizationStats,
} from "@/core/organizations/service"

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

function formatCurrency(amountCents: number, currency = "UGX") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100)
}

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

  // Find owner member
  const ownerMember =
    org.members.find((m) => m.role.toLowerCase() === "owner") ||
    org.members.find((m) => m.role.toLowerCase() === "admin") ||
    org.members[0]

  const ownerUser = ownerMember?.user

  return (
    <AdminDashboardShell>
      {/* ── Top Bar / Navigation Back Link & Status Actions ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" asChild className="rounded-xl">
            <Link href="/organizations" aria-label="Back to organizations">
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-heading font-semibold text-xl tracking-tight">
                {org.name}
              </h2>
              <StatusBadge status={org.status} />
            </div>
            <p className="mt-0.5 text-muted-foreground text-xs">
              Created {formatDate(org.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OrganizationStatusButtons
            organizationId={org.id}
            currentStatus={org.status}
          />
        </div>
      </div>

      {/* ── Owner Details Banner ── */}
      {ownerUser ? (
        <Card className="overflow-hidden border bg-gradient-to-r from-card via-card to-muted/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Organization Owner
              </CardTitle>
              <Badge variant="secondary" className="capitalize text-xs">
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
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                  {getInitials(ownerUser.name)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1 min-w-48 flex-1">
                <h3 className="font-heading font-semibold text-lg leading-tight">
                  {ownerUser.name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                    {ownerUser.email}
                  </span>
                  {ownerMember.responsibility && (
                    <span className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={UserIcon} className="size-3.5" />
                      {ownerMember.responsibility}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 border-l pl-6 text-xs text-muted-foreground">
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

      {/* ── Financial & Platform Stats Cards Grid ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Spend"
          value={formatCurrency(stats.totalSpendCents, org.baseCurrency)}
          accent="emerald"
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
          value={formatCurrency(stats.totalPaidCents, org.baseCurrency)}
          accent="emerald"
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
          accent="blue"
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
          accent="default"
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

      {/* ── Profile Details Tabs (Members, Projects, Suppliers, Overview) ── */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="w-full justify-start rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="members" className="rounded-lg text-xs font-semibold">
            Team Members ({org.members.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="rounded-lg text-xs font-semibold">
            Projects ({org.projects.length})
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="rounded-lg text-xs font-semibold">
            Suppliers ({org.suppliers.length})
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded-lg text-xs font-semibold">
            Organization Profile
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Team Members ── */}
        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Organization Members
              </CardTitle>
              <CardDescription>
                Users with access to this tenant organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Responsibility</TableHead>
                    <TableHead>Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.members.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No members assigned.
                      </TableCell>
                    </TableRow>
                  ) : (
                    org.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              {member.user.image ? (
                                <AvatarImage
                                  src={member.user.image}
                                  alt={member.user.name}
                                />
                              ) : null}
                              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                {getInitials(member.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground text-sm">
                                {member.user.name}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {member.user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              member.role.toLowerCase() === "owner" || member.role.toLowerCase() === "admin"
                                ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20 capitalize font-semibold text-xs"
                                : "bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-500/20 capitalize font-medium text-xs"
                            }
                          >
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {member.responsibility || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatDate(member.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Projects ── */}
        <TabsContent value="projects" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Organization Projects
              </CardTitle>
              <CardDescription>
                Active and archived projects owned by {org.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Building Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.projects.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No projects created yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    org.projects.map((proj) => (
                      <TableRow key={proj.id}>
                        <TableCell className="font-semibold text-foreground text-sm">
                          {proj.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {proj.location}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs capitalize">
                          {proj.buildingType || "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={proj.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatDate(proj.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 3: Suppliers ── */}
        <TabsContent value="suppliers" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Organization Suppliers
              </CardTitle>
              <CardDescription>
                Registered vendors and suppliers for {org.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {org.suppliers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No suppliers registered yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    org.suppliers.map((sup) => (
                      <TableRow key={sup.id}>
                        <TableCell className="font-semibold text-foreground text-sm">
                          {sup.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs capitalize">
                          {sup.category || "Other"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {sup.phone || sup.email || sup.contactName || "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={sup.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatDate(sup.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 4: Full Profile Metadata ── */}
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
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
                <span className="font-semibold">{org.baseCurrency}</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Created Date</span>
                <span>{formatDate(org.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminDashboardShell>
  )
}
