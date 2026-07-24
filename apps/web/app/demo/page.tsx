import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
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
import type { Metadata } from "next"
import {
  demoExpenses,
  demoProjects,
  demoStats,
  demoSuppliers,
  isDemoMode,
} from "@/core/demo/demo-data"

export const metadata: Metadata = {
  title: "Demo | Zimba",
  description: "Explore Zimba with sample data — no account required.",
}

export const dynamic = "force-dynamic"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function DemoPage() {
  if (!isDemoMode()) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
        <h1 className="font-bold text-xl">Demo mode is not enabled</h1>
        <p className="text-muted-foreground text-sm">
          Set{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            NEXT_PUBLIC_DEMO_MODE=true
          </code>{" "}
          to enable demo access.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-heading font-semibold text-foreground text-lg tracking-tight">
            Demo Workspace
          </h1>
          <p className="text-muted-foreground text-sm">
            Explore Zimba with sample data. No real data is stored or modified.
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          Demo Mode
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Active Projects</p>
          <p className="mt-1 font-bold text-2xl">{demoStats.activeProjects}</p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Total Budget</p>
          <p className="mt-1 font-bold text-2xl">
            {formatCurrency(demoStats.totalBudget)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Total Spent</p>
          <p className="mt-1 font-bold text-2xl">
            {formatCurrency(demoStats.totalSpent)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-muted-foreground text-xs">Pending Approvals</p>
          <p className="mt-1 font-bold text-2xl">
            {demoStats.pendingApprovals}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoProjects.map((p) => {
                const pct = Math.round((p.spent / p.budget) * 100)
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "active"
                            ? "default"
                            : p.status === "completed"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {p.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(p.budget)}</TableCell>
                    <TableCell>{formatCurrency(p.spent)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full ${pct > 80 ? "bg-red-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {pct}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoExpenses.slice(0, 5).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.supplier}</TableCell>
                    <TableCell>{formatCurrency(e.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          e.status === "paid"
                            ? "default"
                            : e.status === "approved"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {e.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoSuppliers.slice(0, 5).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {s.category}
                    </TableCell>
                    <TableCell>{formatCurrency(s.totalSpent)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
