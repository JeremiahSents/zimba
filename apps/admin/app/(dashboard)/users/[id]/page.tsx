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
import { AdminDashboardShell } from "@/components/dashboard-shell"
import {
  PlatformRoleSelect,
  RemovePlatformAccessButton,
} from "@/components/platform-role-select"
import { getPlatformUserDetail } from "@/core/users/service"

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
  const { id } = await params
  const u = await getPlatformUserDetail(id)

  if (!u) {
    notFound()
  }

  return (
    <AdminDashboardShell>
      {/* ── Top Navigation Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" asChild className="rounded-xl">
            <Link href="/users" aria-label="Back to users">
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-heading font-semibold text-xl tracking-tight">
                {u.name}
              </h2>
              {u.platformRole ? (
                <Badge
                  variant="outline"
                  className={
                    u.platformRole === "super_admin"
                      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/20 capitalize text-xs"
                      : "bg-amber-500/15 text-amber-700 border-amber-500/20 capitalize text-xs"
                  }
                >
                  {u.platformRole.replace("_", " ")}
                </Badge>
              ) : (
                <Badge variant="secondary" className="capitalize text-xs">
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
          <CardTitle className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Avatar className="size-16 border-2 border-primary/20 shadow-xs">
              {u.image ? <AvatarImage src={u.image} alt={u.name} /> : null}
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xl">
                {getInitials(u.name)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1 min-w-48 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-semibold text-xl leading-tight">
                  {u.name}
                </h3>
                {u.emailVerified && (
                  <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5" />
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
                  {u.memberships.length} Organization{u.memberships.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-l pl-6 text-xs">
              <span className="text-muted-foreground font-medium">Platform Role</span>
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
            <CardTitle className="text-base font-semibold">
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
                            mem.role.toLowerCase() === "owner" || mem.role.toLowerCase() === "admin"
                              ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-500/20 capitalize font-semibold text-xs"
                              : "bg-blue-500/15 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-500/20 capitalize font-medium text-xs"
                          }
                        >
                          {mem.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/organizations/${mem.organizationId}`}
                          className="text-primary font-medium text-xs underline hover:opacity-80 transition-opacity"
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
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <HugeiconsIcon icon={ShieldKeyIcon} className="size-4 text-primary" />
              Access Settings
            </CardTitle>
            <CardDescription>
              Manage platform administrative permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Super admins have complete access to the administrative dashboard, system health monitors, and tenant data across the entire platform.
            </p>
            <div className="pt-2 border-t">
              <RemovePlatformAccessButton userId={u.id} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
