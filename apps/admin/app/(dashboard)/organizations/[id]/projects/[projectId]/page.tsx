import { getAdminProjectDetailUseCase, type AdminProjectDetailDto } from "@workspace/api"
import { Button } from "@workspace/ui/components/button"
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
  ArrowLeft02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminDashboardShell } from "@/components/dashboard-shell"
import { StatusBadge } from "@/components/status-badge"
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

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string; projectId: string }>
}) {
  const { id: organizationId, projectId } = await params

  let project: AdminProjectDetailDto
  try {
    project = await getAdminProjectDetailUseCase(organizationId, projectId)
  } catch {
    notFound()
  }

  const totalBudget = project.budgetItems.reduce(
    (sum, i) => sum + i.budgetCents,
    0
  )
  const totalSpent = project.budgetItems.reduce(
    (sum, i) => sum + i.spentCents,
    0
  )
  const overallPct =
    totalBudget > 0
      ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
      : 0

  return (
    <AdminDashboardShell
      title={project.name}
      description={`${project.location}${project.clientName ? ` · ${project.clientName}` : ""}`}
    >
      {/* ── Header: back link + project meta ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            asChild
            className="rounded-xl"
          >
            <Link
              href={`/organizations/${organizationId}?tab=projects`}
              aria-label="Back to organization projects"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2.5">
            <StatusBadge status={project.status} />
            <span className="text-muted-foreground text-xs">
              Created {formatDate(project.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Budget overview stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Budget</p>
            <p className="mt-1 font-heading text-lg font-semibold tabular-nums">
              {formatCurrency(totalBudget, project.currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="mt-1 font-heading text-lg font-semibold tabular-nums">
              {formatCurrency(totalSpent, project.currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="mt-1 font-heading text-lg font-semibold tabular-nums">
              {formatCurrency(totalBudget - totalSpent, project.currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Utilization</p>
            <div className="mt-2 flex items-center gap-3">
              <Progress value={overallPct} className="w-24 shrink-0" />
              <span className="font-heading text-lg font-semibold tabular-nums">
                {overallPct}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Budget items vs actual spend ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-semibold text-base">
            Budget Items
          </CardTitle>
          <CardDescription>
            Allocated budget vs actual spend per line item.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.budgetItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No budget items allocated yet.
                  </TableCell>
                </TableRow>
              ) : (
                project.budgetItems.map((item) => {
                  const pct =
                    item.budgetCents > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (item.spentCents / item.budgetCents) * 100
                          )
                        )
                      : 0
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground text-sm">
                        {item.name}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground text-xs whitespace-nowrap">
                        {formatCurrency(item.budgetCents, project.currency)}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground text-xs whitespace-nowrap">
                        {formatCurrency(item.spentCents, project.currency)}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground text-xs whitespace-nowrap">
                        {formatCurrency(
                          item.budgetCents - item.spentCents,
                          project.currency
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={pct} className="w-24 shrink-0" />
                          <span className="text-xs tabular-nums">{pct}%</span>
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

      {/* ── Receipts log ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-semibold text-base">Receipts</CardTitle>
          <CardDescription>
            Expenses logged against this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.receipts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No receipts logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                project.receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium text-foreground text-sm">
                      {receipt.supplierName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={receipt.status} />
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground text-xs whitespace-nowrap">
                      {formatCurrency(receipt.totalCents, project.currency)}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground text-xs whitespace-nowrap">
                      {formatCurrency(receipt.paidCents, project.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {receipt.expenseDate
                        ? formatDate(receipt.expenseDate)
                        : formatDate(receipt.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Payments log ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-semibold text-base">Payments</CardTitle>
          <CardDescription>
            Payments settling receipts or payables on this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No payments recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                project.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium text-foreground text-sm">
                      {payment.supplierName ?? "—"}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground text-xs whitespace-nowrap">
                      {formatCurrency(payment.amountCents, payment.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs capitalize">
                      {payment.method ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {payment.reference ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {payment.paymentDate
                        ? formatDate(payment.paymentDate)
                        : formatDate(payment.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminDashboardShell>
  )
}
