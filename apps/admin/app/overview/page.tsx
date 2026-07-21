import { PageHeader } from "../../components/page-header"
import { StatCard } from "../../components/stat-card"
import { getPlatformStats } from "../../core/services/platform"
import {
  BanknoteIcon,
  Building03Icon,
  FactoryIcon,
  Invoice01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default async function OverviewPage() {
  const stats = await getPlatformStats()

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader 
        title="Platform Overview" 
        description="Monitor system-wide metrics and tenant activity."
      />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Organizations"
          value={stats.totalOrganizations}
          icon={<HugeiconsIcon icon={Building03Icon} strokeWidth={1.7} className="size-4 text-primary" />}
          description={`${stats.activeOrganizations} active`}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.7} className="size-4 text-primary" />}
        />
        <StatCard
          title="Total Receipts"
          value={stats.totalReceipts}
          icon={<HugeiconsIcon icon={Invoice01Icon} strokeWidth={1.7} className="size-4 text-primary" />}
        />
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<HugeiconsIcon icon={FactoryIcon} strokeWidth={1.7} className="size-4 text-primary" />}
        />
        <StatCard
          title="Total Payments"
          value={stats.totalPayments}
          icon={<HugeiconsIcon icon={BanknoteIcon} strokeWidth={1.7} className="size-4 text-primary" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Placeholder for charts or tables */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold leading-none tracking-tight mb-4">Recent Activity</h3>
          <p className="text-sm text-muted-foreground mb-4">Latest events across the platform.</p>
          <div className="space-y-4">
             {/* Mock activity list */}
             <div className="text-sm border-b pb-2">Organization <span className="font-medium">BuildTech</span> joined the platform.</div>
             <div className="text-sm border-b pb-2">User <span className="font-medium">john@example.com</span> upgraded to Pro.</div>
             <div className="text-sm border-b pb-2">Receipt processing failed for <span className="font-medium">Apex Construction</span>.</div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold leading-none tracking-tight mb-4">System Health</h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between text-sm">
               <span>Database Connectivity</span>
               <span className="text-emerald-500 font-medium">Operational</span>
             </div>
             <div className="flex items-center justify-between text-sm">
               <span>Auth Service</span>
               <span className="text-emerald-500 font-medium">Operational</span>
             </div>
             <div className="flex items-center justify-between text-sm">
               <span>File Uploads</span>
               <span className="text-emerald-500 font-medium">Operational</span>
             </div>
             <div className="flex items-center justify-between text-sm">
               <span>Background Jobs</span>
               <span className="text-amber-500 font-medium">Delayed</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
