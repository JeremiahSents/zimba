import {
  BanknoteIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  FileCheckIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  getPendingApplicationCountUseCase,
  getPendingTransferCountUseCase,
  listOnboardingApplicationsUseCase,
  listOwnershipTransferRequestsUseCase,
} from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import type { Metadata } from "next"
import {
  type ApplicationItem,
  ApplicationsTable,
} from "@/components/applications-table"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { StatCard } from "@/components/stat-card"
import { type TransferItem, TransfersTable } from "@/components/transfers-table"
import { requirePlatformSession } from "@/core/auth/service"

export const metadata: Metadata = {
  title: "Applications & Transfers | Zimba Admin",
  description:
    "Review customer onboarding applications and ownership transfer requests.",
}

export const dynamic = "force-dynamic"

async function readWorkflowData<T>(
  label: string,
  readData: () => Promise<T>,
  fallback: T
) {
  try {
    return await readData()
  } catch (error) {
    console.error(`Could not load ${label}.`, error)
    return fallback
  }
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  await requirePlatformSession()
  const { tab } = await searchParams

  const [applications, transfers, pendingApps, pendingTransfers] =
    await Promise.all([
      readWorkflowData(
        "onboarding applications",
        () => listOnboardingApplicationsUseCase(apiExecutor),
        []
      ),
      readWorkflowData(
        "ownership transfers",
        () => listOwnershipTransferRequestsUseCase(apiExecutor),
        []
      ),
      readWorkflowData(
        "pending application count",
        () => getPendingApplicationCountUseCase(apiExecutor),
        0
      ),
      readWorkflowData(
        "pending transfer count",
        () => getPendingTransferCountUseCase(apiExecutor),
        0
      ),
    ])

  const appData: ApplicationItem[] = (applications as ApplicationItem[]).map(
    (r) => ({
      id: r.id,
      fullName: r.fullName,
      email: r.email,
      companyName: r.companyName,
      industry: r.industry,
      country: r.country,
      status: r.status,
      createdAt: r.createdAt,
    })
  )

  const transferData: TransferItem[] = (transfers as TransferItem[]).map(
    (r) => ({
      id: r.id,
      organizationId: r.organizationId,
      organizationName: r.organizationName,
      fromUserName: r.fromUserName,
      fromUserEmail: r.fromUserEmail,
      toUserName: r.toUserName,
      toUserEmail: r.toUserEmail,
      status: r.status,
      reason: r.reason,
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt,
    })
  )

  const approvedApps = applications.filter(
    (a) => a.status === "approved"
  ).length
  const approvedTransfers = transfers.filter(
    (t) => t.status === "approved"
  ).length

  return (
    <AdminDashboardShell>
      {/* ── Subtitle header ── */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Review onboarding applications and manage organization ownership
          transfer requests.
        </p>
      </div>

      {/* ── Top Stats Cards Row for Applications & Transfers ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={applications.length}
          accent="blue"
          trend={{
            value: 12,
            label: "vs last month",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={FileCheckIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Pending Applications"
          value={pendingApps}
          accent={pendingApps > 0 ? "amber" : "emerald"}
          trend={{
            value: pendingApps,
            label: "awaiting review",
            isPositive: pendingApps === 0,
          }}
          icon={
            <HugeiconsIcon
              icon={Clock01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={pendingApps > 0 ? "Requires admin action" : "All clear"}
        />
        <StatCard
          title="Ownership Transfers"
          value={transfers.length}
          accent="default"
          trend={{
            value: pendingTransfers,
            label: "pending approval",
            isPositive: pendingTransfers === 0,
          }}
          icon={
            <HugeiconsIcon
              icon={BanknoteIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={`${pendingTransfers} pending requests`}
        />
        <StatCard
          title="Total Approved"
          value={approvedApps + approvedTransfers}
          accent="emerald"
          trend={{
            value: approvedApps + approvedTransfers,
            label: "completed requests",
            isPositive: true,
          }}
          icon={
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Successful onboarding & transfers"
        />
      </div>

      {/* ── Unified Tabbed Tables ── */}
      <Tabs
        defaultValue={tab === "transfers" ? "transfers" : "applications"}
        className="w-full"
      >
        <TabsList className="w-full justify-start rounded-xl bg-muted/50 p-1">
          <TabsTrigger
            value="applications"
            className="rounded-lg font-semibold text-xs"
          >
            Onboarding Applications ({applications.length})
          </TabsTrigger>
          <TabsTrigger
            value="transfers"
            className="rounded-lg font-semibold text-xs"
          >
            Ownership Transfers ({transfers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-4">
          <ApplicationsTable data={appData} />
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <TransfersTable data={transferData} />
        </TabsContent>
      </Tabs>
    </AdminDashboardShell>
  )
}
