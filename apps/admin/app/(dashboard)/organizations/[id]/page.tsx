import {
  getAdminOrgProjectsUseCase,
  getAdminOrgSuppliersUseCase,
  getOrganizationDetailUseCase,
  getOrganizationStatsUseCase,
} from "@workspace/api"
import { Button } from "@workspace/ui/components/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { OrgDetailOverviewTab } from "@/components/org-detail/overview-tab"
import { OrgDetailProjectsTab } from "@/components/org-detail/projects-tab"
import { OrgDetailSuppliersTab } from "@/components/org-detail/suppliers-tab"
import { OrgDetailTeamTab } from "@/components/org-detail/team-tab"
import { OrganizationStatusButtons } from "@/components/org-status-buttons"
import { StatusBadge } from "@/components/status-badge"
import { VisitOrganizationButton } from "@/components/visit-organization-button"
import { getPlatformSession } from "@/core/auth/service"

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

const VALID_TABS = ["overview", "projects", "suppliers", "team"] as const
type TabValue = (typeof VALID_TABS)[number]

function resolveTab(tab: string | undefined): TabValue {
  return (VALID_TABS as readonly string[]).includes(tab ?? "")
    ? (tab as TabValue)
    : "overview"
}

export default async function OrganizationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const activeTab = resolveTab(tab)

  const [org, stats, projects, suppliers, platformSession] = await Promise.all([
    getOrganizationDetailUseCase(id),
    getOrganizationStatsUseCase(id),
    getAdminOrgProjectsUseCase(id),
    getAdminOrgSuppliersUseCase(id),
    getPlatformSession(),
  ])

  const isSuperAdmin = platformSession?.platformRole === "super_admin"

  if (!org) {
    notFound()
  }

  return (
    <AdminDashboardShell
      action={
        <div className="flex flex-wrap items-center gap-2">
          {isSuperAdmin ? <VisitOrganizationButton organizationId={org.id} /> : null}
          <OrganizationStatusButtons
            organizationId={org.id}
            currentStatus={org.status}
          />
        </div>
      }
    >
      {/* ── Header: back link, org name, status ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            asChild
            className="rounded-xl"
          >
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
      </div>

      {/* ── Scrollable mini tabs ── */}
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto rounded-xl bg-muted/50 p-1">
          <TabsTrigger
            value="overview"
            className="rounded-lg font-semibold text-xs"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="rounded-lg font-semibold text-xs"
          >
            Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger
            value="suppliers"
            className="rounded-lg font-semibold text-xs"
          >
            Suppliers ({suppliers.length})
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="rounded-lg font-semibold text-xs"
          >
            Team ({org.members.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OrgDetailOverviewTab
            org={org}
            stats={stats}
            projects={projects}
            suppliers={suppliers}
          />
        </TabsContent>

        <TabsContent value="projects">
          <OrgDetailProjectsTab
            organizationId={org.id}
            projects={projects}
          />
        </TabsContent>

        <TabsContent value="suppliers">
          <OrgDetailSuppliersTab
            suppliers={suppliers}
            currency={org.currency}
          />
        </TabsContent>

        <TabsContent value="team">
          <OrgDetailTeamTab members={org.members} />
        </TabsContent>
      </Tabs>
    </AdminDashboardShell>
  )
}
