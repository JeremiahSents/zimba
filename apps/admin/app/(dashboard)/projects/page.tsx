import { FactoryIcon, Invoice01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { listPlatformProjects } from "@/core/organizations/projects"

function formatProjectSpendTotals(
  projects: Array<{ totalSpendCents: number | string; currency: string }>
) {
  const totals = new Map<string, number>()
  for (const project of projects) {
    totals.set(
      project.currency,
      (totals.get(project.currency) ?? 0) + Number(project.totalSpendCents ?? 0)
    )
  }

  const formatted = [...totals.entries()].map(([currency, amountCents]) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amountCents / 100)
  )

  if (formatted.length === 0) return "0"
  if (formatted.length <= 2) return formatted.join(" / ")
  return `${formatted[0]} + ${formatted.length - 1} more`
}

export default async function ProjectsPage() {
  const projects = await listPlatformProjects()

  const activeCount = projects.filter((p) => p.status === "active").length
  const totalReceipts = projects.reduce((sum, p) => sum + p.receiptCount, 0)

  return (
    <div className="flex-1 p-6 lg:p-8">
      <PageHeader
        title="Projects"
        description="Platform-wide project monitoring."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={projects.length}
          icon={
            <HugeiconsIcon
              icon={FactoryIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Active"
          value={activeCount}
          icon={
            <HugeiconsIcon
              icon={FactoryIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Total Receipts"
          value={totalReceipts}
          icon={
            <HugeiconsIcon
              icon={Invoice01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
        <StatCard
          title="Total Spend"
          value={formatProjectSpendTotals(projects)}
          icon={
            <HugeiconsIcon
              icon={Invoice01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Receipts</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.organizationName}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>{p.location}</TableCell>
                  <TableCell>{p.receiptCount}</TableCell>
                  <TableCell>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
