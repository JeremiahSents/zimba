"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Pie, PieChart, Cell } from "recharts"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { ChartContainer, type ChartConfig } from "@workspace/ui/components/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@workspace/ui/components/sheet"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { formatCurrency, formatPercent, formatShortDate } from "@/lib/zimba/format"
import type { ProjectDetailResponse } from "@/lib/zimba/types"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { readStoredProjects } from "@/lib/zimba/project-store"

const colors = ["#e47b3c", "#397f6a", "#7d948b", "#b2bcb5", "#bd652b"]
const chartConfig: ChartConfig = { value: { label: "Spent", color: "#e47b3c" } }

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
  const [addingUpcoming, setAddingUpcoming] = useState(false)
  const [newUpcoming, setNewUpcoming] = useState({ name: "", amount: "" })

  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const taskData = project.tasks.map((task) => ({ name: task.name, value: task.spent })).filter((task) => task.value > 0)
  const taskTotal = taskData.reduce((sum, task) => sum + task.value, 0)
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
    <div className="flex items-center justify-between gap-4"><Link href="/dashboard/projects" className="text-sm font-semibold text-primary">← All projects</Link><Button onClick={() => setOpen(true)}>+ New expense</Button></div>
    
    <div className="grid gap-6 lg:grid-cols-2 mb-6">
      <Card className="overflow-hidden bg-primary text-primary-foreground flex flex-col justify-between">
        <CardContent className="p-8">
          <div className="flex justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/65">Total budget</p>
              <p className="mt-2 font-heading text-4xl font-bold tracking-tight">{formatCurrency(project.budget)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/65">Spent</p>
              <p className="font-heading text-2xl font-semibold">{formatCurrency(spent)}</p>
            </div>
          </div>
          <div className="mt-8">
            <UtilBar value={utilisation} dark />
            <div className="mt-4 flex justify-between text-sm font-medium text-primary-foreground/80">
              <span>{formatPercent(utilisation)} utilised</span>
              <span>{formatCurrency(Math.max(project.budget - spent, 0))} remaining</span>
            </div>
          </div>
        </CardContent>
        <div className="bg-primary-foreground/10 px-8 py-4 text-sm text-primary-foreground/80 font-medium">
          {project.location}{project.plot_size ? ` · ${project.plot_size}` : ""}
        </div>
      </Card>

      <Card className="min-w-0 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle>Spend Overview</CardTitle>
          <CardDescription>Visual breakdown of project spending by category.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center gap-8 p-6">
          <div className="relative flex items-center justify-center h-48 w-48 shrink-0">
            <ChartContainer config={chartConfig} className="absolute inset-0 aspect-auto h-full w-full">
              <PieChart>
                <Pie data={taskData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={96} strokeWidth={0} paddingAngle={2}>
                  {taskData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="text-center z-10 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-heading font-bold text-primary">{utilisation}%</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Utilised</span>
            </div>
          </div>
          <div className="grid min-w-0 gap-4 flex-1">
            {taskData.map((task, index) => (
              <div key={task.name} className="flex min-w-0 items-center gap-3">
                <span className="size-3.5 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: colors[index % colors.length] }} /> 
                <div className="grid gap-0.5 min-w-0">
                  <span className="truncate text-sm font-semibold">{task.name}</span>
                  <span className="text-xs text-muted-foreground">{formatCurrency(task.value)}</span>
                </div>
                <span className="ml-auto font-bold text-sm bg-muted px-2 py-0.5 rounded-md text-primary">
                  {formatPercent((task.value / Math.max(taskTotal, 1)) * 100)}
                </span>
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
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-6">Date</TableHead>
                <TableHead>Item / Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right pr-6">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.slice(0, 8).map((expense) => (
                <TableRow key={expense.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="pl-6 text-muted-foreground">{formatShortDate(expense.date)}</TableCell>
                  <TableCell className="font-medium">
                    <div className="grid gap-0.5">
                      <span>{expense.item_description}</span>
                      <span className="text-xs text-muted-foreground">{expense.task_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{expense.supplier_name}</TableCell>
                  <TableCell className="text-right font-semibold pr-6 text-primary">{formatCurrency(expense.amount)}</TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No expenses recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="flex flex-col h-full overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 pb-4 pt-5 px-5">
          <CardTitle className="text-base font-semibold">Upcoming Payments</CardTitle>
          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full shrink-0" onClick={() => setAddingUpcoming(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="flex flex-col divide-y divide-border">
            {addingUpcoming && (
              <div className="p-5 bg-primary/5 grid gap-3 animate-in slide-in-from-top-2">
                <Input placeholder="Payment description" value={newUpcoming.name} onChange={(e) => setNewUpcoming({...newUpcoming, name: e.target.value})} className="h-9 text-sm bg-background" />
                <Input type="number" placeholder="Amount" value={newUpcoming.amount} onChange={(e) => setNewUpcoming({...newUpcoming, amount: e.target.value})} className="h-9 text-sm bg-background" />
                <div className="flex justify-end gap-2 mt-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { setAddingUpcoming(false); setNewUpcoming({name: "", amount: ""}) }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" onClick={() => {
                    if (newUpcoming.name && newUpcoming.amount) {
                      setUpcoming([{ id: Date.now(), name: newUpcoming.name, amount: Number(newUpcoming.amount), date: new Date().toISOString().slice(0,10) }, ...upcoming])
                      setAddingUpcoming(false)
                      setNewUpcoming({name: "", amount: ""})
                    }
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </Button>
                </div>
              </div>
            )}
            {upcoming.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-5 hover:bg-muted/40 transition-colors">
                <div className="grid gap-1">
                  <span className="text-sm font-semibold">{item.name}</span>
                  <span className="text-xs font-medium text-muted-foreground">{formatShortDate(item.date)}</span>
                </div>
                <span className="text-sm font-bold text-primary">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            {upcoming.length === 0 && !addingUpcoming && (
              <div className="p-8 text-center text-sm text-muted-foreground">No upcoming payments.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>

    <Sheet open={open} onOpenChange={setOpen}><SheetContent><SheetHeader><SheetTitle>Add an expense</SheetTitle><SheetDescription>Log a payment for {project.name}.</SheetDescription></SheetHeader><form onSubmit={submit} className="grid gap-4 px-6"><Field label="Date" value={form.date} onChange={(v) => update("date", v)} type="date" /><Field label="Task" value={form.task_name} onChange={(v) => update("task_name", v)} /><Field label="Supplier" value={form.supplier_name} onChange={(v) => update("supplier_name", v)} placeholder="Supplier name" /><Field label="Item" value={form.item_description} onChange={(v) => update("item_description", v)} placeholder="What was purchased?" /><Field label="Amount (UGX)" value={form.amount} onChange={(v) => update("amount", v)} placeholder="0" type="number" /><SheetFooter className="px-0"><Button type="submit">Save expense</Button></SheetFooter></form></SheetContent></Sheet>
  </DashboardShell>
}

function Field({ label, value, onChange, placeholder = "", type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) { return <label className="grid gap-2"><Label>{label}</Label><Input required type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label> }

function UtilBar({ value, dark = false }: { value: number; dark?: boolean }) {
  return <div className={`mt-7 h-3 w-full overflow-hidden rounded-full ${dark ? "bg-white/20" : "bg-muted"}`}><div className={`h-full rounded-full transition-all ${dark ? "bg-accent" : "bg-primary"}`} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} /></div>
}
