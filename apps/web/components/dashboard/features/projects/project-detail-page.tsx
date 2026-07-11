"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Pie, PieChart, Cell } from "recharts"
import { Button } from "@workspace/ui/components/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { ChartContainer, type ChartConfig } from "@workspace/ui/components/chart"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { formatCurrency, formatPercent, formatShortDate } from "@/lib/zimba/format"
import type { ProjectDetailResponse } from "@/lib/zimba/types"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { readStoredProjects } from "@/lib/zimba/project-store"
import { ProjectExpensesTable } from "@/components/dashboard/features/projects/project-expenses-table"

const colors = [
  "var(--primary)",
  "color-mix(in oklch, var(--primary) 78%, white)",
  "color-mix(in oklch, var(--primary) 58%, white)",
  "color-mix(in oklch, var(--primary) 40%, white)",
  "color-mix(in oklch, var(--primary) 24%, white)",
]
const chartConfig: ChartConfig = { value: { label: "Spent", color: "var(--primary)" } }

export function ProjectDetailPageWrapper({ id, initialProject }: { id: number; initialProject?: ProjectDetailResponse }) {
  const [project, setProject] = useState<ProjectDetailResponse | undefined>(initialProject)
  const [loading, setLoading] = useState(!initialProject)

  useEffect(() => {
    if (!initialProject) {
      const stored = readStoredProjects().find((p) => p.id === id)
      if (stored) {
        setProject({
          ...stored,
          expenses: [],
          tasks: [
            { id: 1, name: "Materials", budget: Math.round(stored.budget * 0.45), spent: 0, pct: 0 },
            { id: 2, name: "Labour", budget: Math.round(stored.budget * 0.3), spent: 0, pct: 0 }
          ],
          suppliers: []
        })
      }
      setLoading(false)
    }
  }, [id, initialProject])

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading project...</div>
  if (!project) return notFound()

  return <ProjectDetailPage project={project} />
}

export function ProjectDetailPage({ project }: { project: ProjectDetailResponse }) {
  const [expenses, setExpenses] = useState(project.expenses)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), task_name: project.tasks[0]?.name ?? "Materials", supplier_name: "", item_description: "", amount: "" })
  const [upcoming, setUpcoming] = useState([
    { id: 1, name: "Cement Delivery", date: "2026-07-28", amount: 15_000_000 },
    { id: 2, name: "Site Security", date: "2026-07-30", amount: 2_500_000 },
  ])
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [newUpcoming, setNewUpcoming] = useState({ name: "", amount: "" })

  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const taskData = project.tasks.map((task) => ({ name: task.name, value: task.spent })).filter((task) => task.value > 0)
  const utilisation = Math.round((spent / project.budget) * 100)
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  
  function submit(event: React.FormEvent) { 
    event.preventDefault(); 
    if (!form.amount || !form.supplier_name || !form.item_description) return; 
    setExpenses((current) => [{ ...form, id: Date.now(), amount: Number(form.amount) }, ...current]); 
    setOpen(false); 
    setForm((current) => ({ ...current, supplier_name: "", item_description: "", amount: "" })) 
  }

  return <DashboardShell title={project.name} subtitle="Project financial position and delivery tracking." dataSource="mock">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><Link href="/dashboard/projects" className="font-semibold text-primary hover:underline">Projects</Link><span>/</span><span>{project.name}</span></div><h2 className="font-heading text-2xl font-semibold tracking-tight">{project.name}</h2><p className="mt-1 text-xs text-muted-foreground">{project.location}{project.plot_size ? ` · ${project.plot_size}` : ""}</p></div><div className="flex gap-2"><Button variant="outline" size="sm">Share</Button><Button onClick={() => setOpen(true)} size="sm">+ New expense</Button></div></div>
    
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6"><Metric label="Total budget" value={formatCurrency(project.budget)} detail="Baseline budget" /><Metric label="Total spent" value={formatCurrency(spent)} detail="Across project expenses" /><Metric label="Remaining budget" value={formatCurrency(Math.max(project.budget - spent, 0))} detail={`${formatPercent(Math.max(100 - utilisation, 0))} left`} /><Metric label="Utilization" value={formatPercent(utilisation)} detail={utilisation <= 80 ? "On budget" : "Needs attention"} /></div>
    <div className="mb-6 grid items-stretch gap-4 lg:grid-cols-2">
      <Card className="flex h-full flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-0">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CardTitle>Budget overview</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pt-2">
          <div className="flex items-center gap-4">
            <span className="font-heading text-2xl font-semibold tracking-tight tabular-nums">{formatCurrency(project.budget)}</span>
            <span className="text-xs font-semibold text-primary">
              {formatPercent(utilisation)} Utilised
            </span>
          </div>

          <div>
            <p className="mb-4 text-xs font-medium text-muted-foreground">Spending breakdown</p>
            <div className="flex h-8 w-full overflow-hidden rounded-md bg-muted">
              {taskData.map((task, index) => {
                const widthPct = (task.value / Math.max(project.budget, 1)) * 100;
                return <div key={task.name} className="h-full transition-all" title={`${task.name}: ${formatCurrency(task.value)}`} style={{ width: `${widthPct}%`, backgroundColor: colors[index % colors.length] }} />
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-6">
              {taskData.slice(0, 3).map((task, index) => (
                <div key={task.name} className="flex items-center gap-2.5">
                  <span className="size-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="text-xs font-medium leading-none">{task.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex h-full min-w-0 flex-col">
        <CardHeader className="pb-1">
          <CardTitle>Spend overview</CardTitle>
          <CardDescription>Visual breakdown of project spending by category.</CardDescription>
        </CardHeader>
        <CardContent className="grid flex-1 items-center gap-5 sm:grid-cols-[12rem_minmax(0,1fr)]">
          <div className="relative flex aspect-square w-full max-w-[12rem] shrink-0 items-center justify-center justify-self-center sm:justify-self-start">
            <ChartContainer config={chartConfig} className="absolute inset-0 aspect-auto h-full w-full">
              <PieChart>
                <Pie data={taskData} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="88%" strokeWidth={0} paddingAngle={2}>
                  {taskData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="text-center z-10 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-heading text-2xl font-semibold text-foreground tabular-nums">{utilisation}%</span>
              <span className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Utilised</span>
            </div>
          </div>
          <div className="grid min-w-0 content-center gap-3">
            {taskData.map((task, index) => (
              <div key={task.name} className="flex min-w-0 items-center gap-3">
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="truncate text-xs font-medium">{task.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
      <Card className="flex flex-col min-h-0">
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Latest payments logged against this project.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ProjectExpensesTable expenses={expenses} />
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle>Next payments</CardTitle>
          <CardDescription>Planned costs that need to be scheduled or paid.</CardDescription>
          <CardAction>
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full" onClick={() => setPaymentDialogOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="flex flex-col divide-y divide-border">
            {upcoming.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/40">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/></svg>
                </span>
                <div className="flex min-w-0 flex-1 items-baseline gap-2">
                  <span className="truncate text-sm font-medium">{item.name}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">Due {formatShortDate(item.date)}</span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-primary">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No upcoming payments.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add upcoming payment</DialogTitle>
          <DialogDescription>Record a planned payment for {project.name}.</DialogDescription>
        </DialogHeader>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2"><Label>Payment description</Label><Input value={newUpcoming.name} onChange={(event) => setNewUpcoming({ ...newUpcoming, name: event.target.value })} placeholder="e.g. Cement delivery" /></label>
          <label className="grid gap-2"><Label>Amount (UGX)</Label><Input type="number" value={newUpcoming.amount} onChange={(event) => setNewUpcoming({ ...newUpcoming, amount: event.target.value })} placeholder="0" /></label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setPaymentDialogOpen(false); setNewUpcoming({ name: "", amount: "" }) }}>Cancel</Button>
          <Button onClick={() => {
            if (!newUpcoming.name || !newUpcoming.amount) return
            setUpcoming([{ id: Date.now(), name: newUpcoming.name, amount: Number(newUpcoming.amount), date: new Date().toISOString().slice(0, 10) }, ...upcoming])
            setPaymentDialogOpen(false)
            setNewUpcoming({ name: "", amount: "" })
          }}>Add payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Sheet open={open} onOpenChange={setOpen}><SheetContent><SheetHeader><SheetTitle>Add an expense</SheetTitle><SheetDescription>Log a payment for {project.name}.</SheetDescription></SheetHeader><form onSubmit={submit} className="grid gap-4 px-6"><Field label="Date" value={form.date} onChange={(v) => update("date", v)} type="date" /><Field label="Task" value={form.task_name} onChange={(v) => update("task_name", v)} /><Field label="Supplier" value={form.supplier_name} onChange={(v) => update("supplier_name", v)} placeholder="Supplier name" /><Field label="Item" value={form.item_description} onChange={(v) => update("item_description", v)} placeholder="What was purchased?" /><Field label="Amount (UGX)" value={form.amount} onChange={(v) => update("amount", v)} placeholder="0" type="number" /><SheetFooter className="px-0"><Button type="submit">Save expense</Button></SheetFooter></form></SheetContent></Sheet>
  </DashboardShell>
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <Card className="flex flex-row items-center justify-between gap-4 p-5"><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 font-heading text-xl font-semibold tracking-tight tabular-nums">{value}</p></div><p className="max-w-[80px] text-right text-[10px] font-medium text-muted-foreground">{detail}</p></Card> }

function Field({ label, value, onChange, placeholder = "", type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) { return <label className="grid gap-2"><Label>{label}</Label><Input required type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label> }

function UtilBar({ value, dark = false }: { value: number; dark?: boolean }) {
  return <div className={`mt-7 h-3 w-full overflow-hidden rounded-full ${dark ? "bg-white/20" : "bg-muted"}`}><div className={`h-full rounded-full transition-all ${dark ? "bg-accent" : "bg-primary"}`} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} /></div>
}
