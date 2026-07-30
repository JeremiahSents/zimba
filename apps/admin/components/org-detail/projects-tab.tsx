import type { AdminProjectSummaryDto } from "@workspace/api"
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
import Link from "next/link"
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

function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .replace(/\b\p{L}/gu, (match) => match.toUpperCase())
}

export function OrgDetailProjectsTab({
  organizationId,
  projects,
}: {
  organizationId: string
  projects: AdminProjectSummaryDto[]
}) {
  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="font-semibold text-base">
          Organization Projects
        </CardTitle>
        <CardDescription>
          Budget vs actual spend per project. Click a project for the full
          transaction log.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Utilization</TableHead>
              <TableHead>Status</TableHead>
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
                  No projects created yet.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((proj) => {
                const pct =
                  proj.budgetCents > 0
                    ? Math.min(
                        100,
                        Math.round((proj.spentCents / proj.budgetCents) * 100)
                      )
                    : 0
                return (
                  <TableRow key={proj.id}>
                    <TableCell className="font-medium text-foreground text-sm">
                      <Link
                        href={`/organizations/${organizationId}/projects/${proj.id}`}
                        className="outline-none transition-colors hover:text-primary focus-visible:underline"
                      >
                        {toTitleCase(proj.name)}
                      </Link>
                      <p className="text-foreground/80 text-sm">
                        {toTitleCase(proj.location)}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm tabular-nums text-foreground">
                      {formatCompactCurrency(proj.budgetCents, proj.currency)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm tabular-nums text-foreground">
                      {formatCompactCurrency(proj.spentCents, proj.currency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={pct} className="w-28 shrink-0" />
                        <span className="text-sm tabular-nums">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={proj.status} />
                    </TableCell>
                    <TableCell className="text-foreground text-sm">
                      {formatDate(proj.createdAt)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
