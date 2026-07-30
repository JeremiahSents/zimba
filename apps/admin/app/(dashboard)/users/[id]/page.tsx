import {
  ArrowLeft02Icon,
  Building03Icon,
  CheckmarkCircle02Icon,
  Mail01Icon,
  ShieldKeyIcon,
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
import Link from "next/link"
import { notFound } from "next/navigation"
import { AccountRemovalPanel } from "@/components/account-removal-panel"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import {
  PlatformRoleSelect,
  RemovePlatformAccessButton,
} from "@/components/platform-role-select"
import { requirePlatformSession } from "@/core/auth/service"
import {
  getAccountRemovalPreview,
  getPlatformUserDetail,
} from "@/core/users/service"

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

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requirePlatformSession()
  const { id } = await params
  const u = await getPlatformUserDetail(id)

  if (!u) {
    notFound()
  }

  // Support staff can read this page; only super admins may remove an account,
  // so the preview (and the panel) is skipped entirely for everyone else.
  const isSuperAdmin = session.platformRole === "super_admin"
  const removal = isSuperAdmin
    ? await getAccountRemovalPreview(session.user.id, u.id)
    : null

  return (
    <AdminDashboardShell>
      {/* ── Top Navigation Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            asChild
            className="rounded-xl"
          >
            <Link href="/users" aria-label="Back to users">
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-heading font-semibold text-xl tracking-tight">
                {u.name}
              </h2>
              {u.deactivatedAt ? (
                <Badge variant="destructive" className="text-xs">
                  Deactivated
                </Badge>
              ) : null}
              {u.platformRole ? (
                <Badge
                  variant="outline"
                  className={
                    u.platformRole === "super_admin"
                      ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-700 text-xs capitalize"
                      : "border-amber-500/20 bg-amber-500/15 text-amber-700 text-xs capitalize"
                  }
                >
                  {u.platformRole.replace("_", " ")}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs capitalize">
                  User
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-muted-foreground text-xs">
              Account created {formatDate(u.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ── User Profile Header Card ── */}
      <Card className="overflow-hidden border bg-gradient-to-r from-card via-card to-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Avatar className="size-16 border-2 border-primary/20 shadow-xs">
              {u.image ? <AvatarImage src={u.image} alt={u.name} /> : null}
              <AvatarFallback className="bg-primary font-semibold text-primary-foreground text-xl">
                {getInitials(u.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-48 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-semibold text-xl leading-tight">
                  {u.name}
                </h3>
                {u.emailVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 text-xs">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      className="size-3.5"
                    />
                    Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Mail01Icon} className="size-3.5" />
                  {u.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Building03Icon} className="size-3.5" />
                  {u.memberships.length} Organization
                  {u.memberships.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-l pl-6 text-xs">
              <span className="font-medium text-muted-foreground">
                Platform Role
              </span>
              <PlatformRoleSelect
                userId={u.id}
                currentRole={u.platformRole ?? "none"}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Organization Memberships & Access Card ── */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="font-semibold text-base">
              Organization Memberships
            </CardTitle>
            <CardDescription>
              Organizations this user belongs to and their assigned roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {u.memberships.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Not a member of any organization.
                    </TableCell>
                  </TableRow>
                ) : (
                  u.memberships.map((mem) => (
                    <TableRow key={mem.organizationId}>
                      <TableCell className="font-semibold text-foreground text-sm">
                        {mem.organizationName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            mem.role.toLowerCase() === "owner" ||
                            mem.role.toLowerCase() === "admin"
                              ? "border-emerald-500/20 bg-emerald-500/15 font-semibold text-emerald-700 text-xs capitalize dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "border-blue-500/20 bg-blue-500/15 font-medium text-blue-700 text-xs capitalize dark:bg-blue-500/10 dark:text-blue-400"
                          }
                        >
                          {mem.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/organizations/${mem.organizationId}`}
                          className="font-medium text-primary text-xs underline transition-opacity hover:opacity-80"
                        >
                          View Org
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ── Platform Access Actions ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-semibold text-base">
              <HugeiconsIcon
                icon={ShieldKeyIcon}
                className="size-4 text-primary"
              />
              Access Settings
            </CardTitle>
            <CardDescription>
              Manage platform administrative permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-xs leading-relaxed">
              Super admins have complete access to the administrative dashboard,
              system health monitors, and tenant data across the entire
              platform.
            </p>
            <div className="border-t pt-2">
              <RemovePlatformAccessButton userId={u.id} />
            </div>
          </CardContent>
        </Card>
      </div>

      {removal ? (
        <AccountRemovalPanel
          userId={u.id}
          name={u.name}
          email={u.email}
          deactivatedAt={removal.deactivatedAt}
          deactivationReason={removal.deactivationReason}
          blockers={removal.blockers}
          canDelete={removal.canDelete}
        />
      ) : null}
    </AdminDashboardShell>
  )
}
