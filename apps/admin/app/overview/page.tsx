import { PageHeader } from "../../components/page-header"
import { StatCard } from "../../components/stat-card"
import { getPlatformStats } from "../../core/services/platform"
import { 
  Building03Icon, 
  UsersGroupIcon, 
  CreditCardIcon, 
  FileInvoiceIcon,
  FactoryIcon,
  BankNote01Icon
} from "@hugeicons/react"

export default async function OverviewPage() {
  const stats = await getPlatformStats()

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader 
        title="Platform Overview" 
        description="Monitor system-wide metrics and tenant activity."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Organizations"
          value={stats.totalOrganizations}
          icon={<Building03Icon size={20} />}
          description={`${stats.activeOrganizations} active, ${stats.trialOrganizations} on trial`}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<UsersGroupIcon size={20} />}
        />
        <StatCard
          title="Monthly Recurring Revenue"
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.mrr)}
          icon={<CreditCardIcon size={20} />}
          description="Mock MRR (placeholder)"
        />
        <StatCard
          title="Failed Payments"
          value={stats.failedPayments}
          icon={<BankNote01Icon size={20} className="text-red-500" />}
          description="Needs attention"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Receipts"
          value={stats.totalReceipts}
          icon={<FileInvoiceIcon size={20} />}
        />
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={<FactoryIcon size={20} />}
        />
        <StatCard
          title="Total Payments"
          value={stats.totalPayments}
          icon={<BankNote01Icon size={20} />}
        />
        <StatCard
          title="Attention Needed"
          value={stats.organizationsNeedingAttention}
          icon={<Building03Icon size={20} className="text-amber-500" />}
          description="Organizations requiring support"
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
