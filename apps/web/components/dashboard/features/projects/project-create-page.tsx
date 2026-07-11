"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { storeProject } from "@/lib/zimba/project-store"

type Allocation = { id: number; name: string; budget: string; unitCost: string }
const initialRows: Allocation[] = [
  { id: 1, name: "Land", budget: "", unitCost: "" },
  { id: 2, name: "Labour", budget: "", unitCost: "" },
  { id: 3, name: "Materials", budget: "", unitCost: "" },
]

export function ProjectCreatePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [landSize, setLandSize] = useState("")
  const [buildingType, setBuildingType] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [rows, setRows] = useState(initialRows)
  const [error, setError] = useState("")
  const totalBudget = useMemo(() => rows.reduce((sum, row) => sum + Number(row.budget || 0), 0), [rows])
  const updateRow = useCallback((id: number, field: keyof Allocation, value: string) => setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row))), [])
  const columns = useMemo<ColumnDef<Allocation>[]>(() => [
    { accessorKey: "name", header: "Expense name", cell: ({ row }) => <Input value={row.original.name} onChange={(event) => updateRow(row.original.id, "name", event.target.value)} /> },
    ...(["budget", "unitCost"] as const).map((field) => ({ accessorKey: field, header: field === "unitCost" ? "Unit cost" : "Budget", cell: ({ row }: { row: { original: Allocation } }) => <Input type="number" min="0" value={row.original[field]} onChange={(event) => updateRow(row.original.id, field, event.target.value)} placeholder="0" /> })),
    { id: "actions", header: "", cell: ({ row }) => <button type="button" aria-label={`Remove ${row.original.name || "item"}`} className="text-lg leading-none text-muted-foreground hover:text-destructive" onClick={() => setRows((current) => current.filter((item) => item.id !== row.original.id))}>×</button> },
  ], [updateRow])
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || !location.trim() || !landSize.trim() || !buildingType) {
      setError("Complete the required project details before creating the project.")
      return
    }
    storeProject({ id: Date.now(), name, location, plot_size: landSize, budget: totalBudget, spent: 0, remaining: totalBudget, pct: 0 })
    router.push("/dashboard/projects")
  }

  return <DashboardShell title="New project" subtitle=""><form onSubmit={submit} className="grid gap-6">
    <div className="flex items-center justify-between gap-4"><div><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/dashboard/projects">Projects</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>New project</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb><h2 className="mt-2 font-heading text-xl font-semibold">Create a project</h2><p className="mt-1 text-xs text-muted-foreground">Set up the project details and initial budget allocation.</p></div><div className="flex gap-2"><Button type="button" variant="outline" render={<Link href="/dashboard/projects" />}>Cancel</Button><Button type="submit">Create project</Button></div></div>
    {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    <Card><CardHeader><CardTitle>Project details</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Field label="Project name" value={name} onChange={setName} placeholder="Kironde Road Apartments" required /><Field label="Location" value={location} onChange={setLocation} placeholder="Kololo, Kampala" required /><Field label="Land size" value={landSize} onChange={setLandSize} placeholder="2.5 acres" required /><label className="grid gap-2"><Label>Building type</Label><Select value={buildingType} onValueChange={(value) => setBuildingType(value ?? "")}><SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Residential">Residential</SelectItem><SelectItem value="Commercial">Commercial</SelectItem><SelectItem value="Mixed use">Mixed use</SelectItem><SelectItem value="Industrial">Industrial</SelectItem></SelectContent></Select></label><UploadZone files={files} onFiles={(incoming) => setFiles((current) => [...current, ...incoming])} onRemove={(index) => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} /></CardContent></Card>
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]"><div><div className="mb-3 flex items-center justify-between gap-4"><h2 className="font-heading text-base font-semibold">Initial allocation</h2></div><Table className="overflow-hidden rounded-lg border border-border"><TableHeader className="bg-muted/30">{table.getHeaderGroups().map((group) => <TableRow key={group.id} className="border-b border-border hover:bg-transparent">{group.headers.map((header) => <TableHead key={header.id} className="border-r border-border last:border-r-0">{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow>)}</TableHeader><TableBody>{table.getRowModel().rows.map((row) => <TableRow key={row.id} className="border-b border-border last:border-b-0">{row.getVisibleCells().map((cell) => <TableCell key={cell.id} className="border-r border-border last:border-r-0">{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)}</TableBody></Table><Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setRows((current) => [...current, { id: Date.now(), name: "", budget: "", unitCost: "" }])}>+ Add item</Button></div><aside className="h-fit rounded-lg border bg-muted/20 p-4 lg:sticky lg:top-4"><p className="text-xs font-medium text-muted-foreground">Project budget</p><p className="mt-2 font-heading text-xl font-semibold">{totalBudget.toLocaleString()} UGX</p><p className="mt-1 text-[10px] text-muted-foreground">Updates as you add allocation items.</p><div className="mt-4 border-t pt-3 text-xs text-muted-foreground"><div className="flex justify-between"><span>Allocation items</span><span className="font-semibold text-foreground">{rows.length}</span></div></div></aside></section>
  </form></DashboardShell>
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) { return <label className="grid gap-2"><Label>{label}</Label><Input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label> }

function UploadZone({ files, onFiles, onRemove }: { files: File[]; onFiles: (files: File[]) => void; onRemove: (index: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return <div className="grid gap-3 sm:col-span-2"><Label>Images and documents</Label><div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onFiles(Array.from(event.dataTransfer.files)) }} onClick={() => inputRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center hover:bg-muted/40"><input ref={inputRef} hidden type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={(event) => onFiles(Array.from(event.target.files ?? []))} /><p className="text-sm font-semibold">Drag and drop files here</p><p className="mt-1 text-xs text-muted-foreground">Images, PDF, Word, and spreadsheet files</p></div>{files.length > 0 && <div className="grid gap-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"><span className="flex min-w-0 items-center gap-3 truncate">{file.type.startsWith("image/") && <img src={URL.createObjectURL(file)} alt="" className="size-8 rounded object-cover" />}<span className="truncate">{file.name}</span></span><button type="button" className="text-destructive" onClick={(event) => { event.stopPropagation(); onRemove(index) }}>Remove</button></div>)}</div>}</div>
}
