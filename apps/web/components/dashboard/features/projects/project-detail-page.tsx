"use client"

import { useState } from "react"
import Link from "next/link"
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

const colors = ["#e47b3c", "#397f6a", "#7d948b", "#b2bcb5", "#bd652b"]
const chartConfig: ChartConfig = { value: { label: "Spent", color: "#e47b3c" } }

export function ProjectDetailPage({ project }: { project: ProjectDetailResponse }) {
  const [expenses, setExpenses] = useState(project.expenses)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), task_name: project.tasks[0]?.name ?? "Materials", supplier_name: "", item_description: "", amount: "" })
  const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const taskData = project.tasks.map((task) => ({ name: task.name, value: task.spent })).filter((task) => task.value > 0)
  const taskTotal = taskData.reduce((sum, task) => sum + task.value, 0)
  const utilisation = Math.round((spent / project.budget) * 100)
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  function submit(event: React.FormEvent) { event.preventDefault(); if (!form.amount || !form.supplier_name || !form.item_description) return; setExpenses((current) => [{ ...form, id: Date.now(), amount: Number(form.amount) }, ...current]); setOpen(false); setForm((current) => ({ ...current, supplier_name: "", item_description: "", amount: "" })) }
  return <DashboardShell title={project.name} subtitle="Project financial position and delivery tracking." dataSource="mock">
    <div className="flex items-center justify-between gap-4"><Link href="/dashboard/projects" className="text-sm font-semibold text-primary">← All projects</Link><Button onClick={() => setOpen(true)}>+ New expense</Button></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,1fr)]">
      <Card className="overflow-hidden bg-primary text-primary-foreground"><CardContent className="p-7"><div className="flex justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-widest text-primary-foreground/65">Total budget</p><p className="mt-2 font-heading text-3xl font-semibold">{formatCurrency(project.budget)}</p></div><div className="text-right"><p className="text-sm text-primary-foreground/65">Spent</p><p className="font-heading text-2xl font-semibold">{formatCurrency(spent)}</p></div></div><UtilBar value={utilisation} dark /><div className="mt-4 flex justify-between text-sm text-primary-foreground/70"><span>{formatPercent(utilisation)} utilised</span><span>{formatCurrency(Math.max(project.budget - spent, 0))} remaining</span></div><p className="mt-7 text-primary-foreground/70">{project.location}{project.plot_size ? ` · ${project.plot_size}` : ""}</p></CardContent></Card>
      <Card className="min-w-0"><CardHeader><CardTitle>Spend by task</CardTitle><CardDescription>How the project budget is being used.</CardDescription></CardHeader><CardContent className="flex min-h-48 items-center gap-5 overflow-hidden"><ChartContainer config={chartConfig} className="aspect-auto h-44 w-44 shrink-0"><PieChart><Pie data={taskData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3}>{taskData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie></PieChart></ChartContainer><div className="grid min-w-0 gap-2 text-sm">{taskData.map((task, index) => <div key={task.name} className="flex min-w-0 items-center gap-2"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} /> <span className="truncate">{task.name}</span><span className="ml-auto font-semibold">{formatPercent((task.value / Math.max(taskTotal, 1)) * 100)}</span></div>)}</div></CardContent></Card>
    </div>
    <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>By project task</CardTitle><CardDescription>Budget progress across the work plan.</CardDescription></div><span className="text-sm font-semibold text-primary">{formatPercent(utilisation)} utilised</span></CardHeader><CardContent className="grid gap-3">{project.tasks.map((task) => <div key={task.id} className="grid gap-3 rounded-xl border p-4 md:grid-cols-[180px_1fr_220px] md:items-center"><span className="font-semibold">{task.name}</span><Progress value={task.pct} /><span className="text-right text-sm text-muted-foreground">{formatCurrency(task.spent)} of {formatCurrency(task.budget)}</span></div>)}</CardContent></Card>
    <Card><CardHeader><CardTitle>Utilisation tracking</CardTitle><CardDescription>Current spend against the approved project allocation.</CardDescription></CardHeader><CardContent><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-heading text-4xl font-semibold text-primary">{formatPercent(utilisation)}</p><p className="mt-1 text-sm text-muted-foreground">of project budget utilised</p></div><div className="rounded-xl bg-muted px-4 py-3 text-right"><p className="text-xs uppercase tracking-wider text-muted-foreground">Available</p><p className="font-semibold">{formatCurrency(Math.max(project.budget - spent, 0))}</p></div></div><UtilBar value={utilisation} /></CardContent></Card>
    <Card><CardHeader><CardTitle>Expenses</CardTitle><CardDescription>Payments logged against this project.</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Task</TableHead><TableHead>Supplier</TableHead><TableHead>Item</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader><TableBody>{expenses.map((expense) => <TableRow key={expense.id}><TableCell>{formatShortDate(expense.date)}</TableCell><TableCell className="font-medium">{expense.task_name}</TableCell><TableCell>{expense.supplier_name}</TableCell><TableCell>{expense.item_description}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(expense.amount)}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card>
    <Card><CardHeader><CardTitle>By supplier</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-3">{project.suppliers.map((supplier) => <div key={supplier.name} className="rounded-xl border p-4"><p className="font-semibold">{supplier.name}</p><p className="mt-2 text-lg font-semibold text-primary">{formatCurrency(supplier.amount)}</p></div>)}</CardContent></Card>
    <Sheet open={open} onOpenChange={setOpen}><SheetContent><SheetHeader><SheetTitle>Add an expense</SheetTitle><SheetDescription>Log a payment for {project.name}.</SheetDescription></SheetHeader><form onSubmit={submit} className="grid gap-4 px-6"><Field label="Date" value={form.date} onChange={(v) => update("date", v)} type="date" /><Field label="Task" value={form.task_name} onChange={(v) => update("task_name", v)} /><Field label="Supplier" value={form.supplier_name} onChange={(v) => update("supplier_name", v)} placeholder="Supplier name" /><Field label="Item" value={form.item_description} onChange={(v) => update("item_description", v)} placeholder="What was purchased?" /><Field label="Amount (UGX)" value={form.amount} onChange={(v) => update("amount", v)} placeholder="0" type="number" /><SheetFooter className="px-0"><Button type="submit">Save expense</Button></SheetFooter></form></SheetContent></Sheet>
  </DashboardShell>
}

function Field({ label, value, onChange, placeholder = "", type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) { return <label className="grid gap-2"><Label>{label}</Label><Input required type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label> }

function UtilBar({ value, dark = false }: { value: number; dark?: boolean }) {
  return <div className={`mt-7 h-3 w-full overflow-hidden rounded-full ${dark ? "bg-white/20" : "bg-muted"}`}><div className={`h-full rounded-full transition-all ${dark ? "bg-accent" : "bg-primary"}`} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} /></div>
}
