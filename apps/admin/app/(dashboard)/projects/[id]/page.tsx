import {
  ArrowLeft02Icon,
  Building03Icon,
  Calendar03Icon,
  FactoryIcon,
  Invoice01Icon,
  Location01Icon,
  Money01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { listPlatformProjects } from "@/core/organizations/projects"
import { formatCompactCurrency } from "@/lib/format-currency"

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

function formatFullCurrency(amountCents: number, currency = "UGX") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amountCents / 100)
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const projects = await listPlatformProjects()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    notFound()
  }

  const totalSpendCents = Number(project.totalSpendCents || 0)

  return (
    <AdminDashboardShell>
      {/* ── Top Navigation Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" asChild className="rounded-xl">
            <Link href="/projects" aria-label="Back to projects">
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-heading font-semibold text-xl tracking-tight">
                {project.name}
              </h2>
              <StatusBadge status={project.status} />
            </div>
            <p className="mt-0.5 text-muted-foreground text-xs">
              Location: {project.location} · Created {formatDate(project.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Project Header Banner ── */}
      <Card className="overflow-hidden border bg-gradient-to-r from-card via-card to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
              Project Overview
            </CardTitle>
            <Badge variant="outline" className="capitalize text-xs">
              {project.currency}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-heading font-semibold text-2xl tracking-tight">
                {project.name}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
                  {project.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Building03Icon} className="size-3.5" />
                  Organization:{" "}
                  <Link
                    href={`/organizations/${project.organizationId}`}
                    className="text-primary font-medium underline hover:opacity-80 transition-opacity"
                  >
                    {project.organizationName}
                  </Link>
                </span>
              </div>
            </div>

            <div className="flex flex-col text-right">
              <span className="font-semibold text-2xl text-foreground tabular-nums">
                {formatCompactCurrency(totalSpendCents, project.currency)}
              </span>
              <span className="text-muted-foreground text-xs">
                {formatFullCurrency(totalSpendCents, project.currency)} Total Spend
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Financial & Metrics Stats Cards ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Spend"
          value={formatCompactCurrency(totalSpendCents, project.currency)}
          accent="emerald"
          icon={
            <HugeiconsIcon
              icon={Money01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description={formatFullCurrency(totalSpendCents, project.currency)}
        />
        <StatCard
          title="Logged Receipts"
          value={project.receiptCount}
          accent="blue"
          icon={
            <HugeiconsIcon
              icon={Invoice01Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Total expense receipts"
        />
        <StatCard
          title="Building Type"
          value={project.buildingType || "Standard"}
          accent="default"
          icon={
            <HugeiconsIcon
              icon={FactoryIcon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Architectural spec"
        />
        <StatCard
          title="Base Currency"
          value={project.currency}
          accent="default"
          icon={
            <HugeiconsIcon
              icon={Building03Icon}
              strokeWidth={1.7}
              className="size-4"
            />
          }
          description="Project accounting unit"
        />
      </div>

      {/* ── Specifications & Key Details Cards ── */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Project Specifications
            </CardTitle>
            <CardDescription>
              Technical and structural details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">{project.location}</span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Building Type</span>
              <span className="font-medium capitalize">{project.buildingType || "—"}</span>
            </div>
            {project.clientName && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Client Name</span>
                <span className="font-medium">{project.clientName}</span>
              </div>
            )}
            {project.plotSize && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Plot Size</span>
                <span className="font-medium">{project.plotSize}</span>
              </div>
            )}
            {project.landSize && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Land Size</span>
                <span className="font-medium">{project.landSize}</span>
              </div>
            )}
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={project.status} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Organization & Timeline
            </CardTitle>
            <CardDescription>
              Parent entity and schedule metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Parent Organization</span>
              <Link
                href={`/organizations/${project.organizationId}`}
                className="text-primary font-medium underline hover:opacity-80 transition-opacity"
              >
                {project.organizationName}
              </Link>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Created Date</span>
              <span>{formatDate(project.createdAt)}</span>
            </div>
            {project.startDate && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Start Date</span>
                <span>{formatDate(project.startDate)}</span>
              </div>
            )}
            {project.targetEndDate && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Target End Date</span>
                <span>{formatDate(project.targetEndDate)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardShell>
  )
}
