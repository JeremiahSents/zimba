"use client"

import { useCallback, useMemo, useRef, useState, useEffect } from "react"
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

type Allocation = { id: number; name: string; quantity: string; unitCost: string }
const initialRows: Allocation[] = [
  { id: 1, name: "Land", quantity: "", unitCost: "" },
  { id: 2, name: "Labour", quantity: "", unitCost: "" },
  { id: 3, name: "Materials", quantity: "", unitCost: "" },
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
  const totalBudget = useMemo(() => rows.reduce((sum, row) => sum + (Number(row.quantity || 0) * Number(row.unitCost || 0)), 0), [rows])
  const updateRow = useCallback((id: number, field: keyof Allocation, value: string) => setRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row))), [])
  const columns = useMemo<ColumnDef<Allocation>[]>(() => [
    { accessorKey: "name", header: "Expense name", cell: ({ row }) => <EditableText value={row.original.name} onChange={(value) => updateRow(row.original.id, "name", value)} /> },
    { accessorKey: "quantity", header: () => <div className="text-right">Quantity</div>, cell: ({ row }) => <EditableNumber value={row.original.quantity} onChange={(val) => updateRow(row.original.id, "quantity", val)} /> },
    { accessorKey: "unitCost", header: () => <div className="text-right">Unit cost</div>, cell: ({ row }) => <EditableNumber value={row.original.unitCost} onChange={(val) => updateRow(row.original.id, "unitCost", val)} /> },
    { id: "budget", header: () => <div className="text-right">Budget</div>, cell: ({ row }) => <div className="text-right font-medium text-muted-foreground">{(Number(row.original.quantity || 0) * Number(row.original.unitCost || 0)).toLocaleString()}</div> },
    { id: "actions", header: "", cell: ({ row }) => <button type="button" aria-label={`Remove ${row.original.name || "item"}`} className="text-lg leading-none text-muted-foreground hover:text-destructive w-full text-center" onClick={() => setRows((current) => current.filter((item) => item.id !== row.original.id))}>×</button> },
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
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch">
        <Card className="flex flex-col flex-1"><CardHeader><CardTitle>Project details</CardTitle></CardHeader><CardContent className="flex flex-col flex-1 gap-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Project name" value={name} onChange={setName} placeholder="Kironde Road Apartments" required /><Field label="Location" value={location} onChange={setLocation} placeholder="Kololo, Kampala" required /><Field label="Land size" value={landSize} onChange={setLandSize} placeholder="2.5 acres" required /><label className="grid gap-2"><Label>Building type</Label><Select value={buildingType} onValueChange={(value) => setBuildingType(value ?? "")}><SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Residential">Residential</SelectItem><SelectItem value="Commercial">Commercial</SelectItem><SelectItem value="Mixed use">Mixed use</SelectItem><SelectItem value="Industrial">Industrial</SelectItem></SelectContent></Select></label></div><UploadZone files={files} onFiles={(incoming) => setFiles((current) => [...current, ...incoming])} onRemove={(index) => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} /></CardContent></Card>
        <div className="lg:sticky lg:top-4">
          <Card className="overflow-hidden relative flex flex-col justify-end aspect-[4/5] lg:aspect-[3/4]">
            {files.length > 0 && files[0]?.type.startsWith("image/") ? (
              <img src={URL.createObjectURL(files[0]!)} alt="Project preview" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <img src="/project-placeholder.png" alt="Placeholder" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="relative z-10 p-5 text-white mt-auto grid gap-3">
              <div>
                <h3 className="font-heading text-2xl font-bold leading-tight drop-shadow-md">{name || "New Project"}</h3>
                <p className="text-sm text-white/90 mt-1 drop-shadow-md flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  {location || "Location not set"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {buildingType && (
                  <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md border border-white/30 drop-shadow-sm">
                    {buildingType}
                  </span>
                )}
                {landSize && (
                  <span className="inline-flex items-center rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md text-primary-foreground border border-primary/30 drop-shadow-sm">
                    {landSize}
                  </span>
                )}
              </div>
              <div className="mt-2 border-t border-white/20 pt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Total Budget</p>
                  <p className="font-heading text-xl font-bold tracking-tight mt-0.5">{totalBudget.toLocaleString()} UGX</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <section className="grid gap-5"><div><div className="mb-3 flex items-center justify-between gap-4"><h2 className="font-heading text-base font-semibold">Initial allocation</h2></div><Table className="table-fixed overflow-hidden rounded-lg border border-border"><TableHeader className="bg-muted/30">{table.getHeaderGroups().map((group) => <TableRow key={group.id} className="border-b border-border hover:bg-transparent">{group.headers.map((header) => <TableHead key={header.id} className={`border-r border-border last:border-r-0 ${header.column.id === 'name' ? 'w-[42%]' : header.column.id === 'quantity' ? 'w-[12%]' : header.column.id === 'unitCost' ? 'w-[18%]' : header.column.id === 'budget' ? 'w-[20%]' : header.column.id === 'actions' ? 'w-[8%]' : ''}`}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow>)}</TableHeader><TableBody>{table.getRowModel().rows.map((row) => <TableRow key={row.id} className="border-b border-border last:border-b-0">{row.getVisibleCells().map((cell) => <TableCell key={cell.id} className={`border-r border-border last:border-r-0 ${cell.column.id === 'actions' ? 'p-0 text-center' : ''}`}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)}</TableBody></Table><Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setRows((current) => [...current, { id: Date.now(), name: "", quantity: "", unitCost: "" }])}>+ Add item</Button></div></section>
    </div>
  </form></DashboardShell>
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) { return <label className="grid gap-2"><Label>{label}</Label><Input required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label> }

function EditableText({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [editing, setEditing] = useState(false)
  if (!editing) return <button type="button" className="w-full truncate text-left font-semibold" onClick={() => setEditing(true)}>{value || "Add expense name"}</button>
  return <Input autoFocus value={value} onChange={(event) => onChange(event.target.value)} onBlur={() => setEditing(false)} onKeyDown={(event) => { if (event.key === "Enter") setEditing(false) }} className="font-semibold" />
}

function EditableNumber({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [editing, setEditing] = useState(false)
  if (!editing) return <button type="button" className="w-full text-left tabular-nums text-muted-foreground" onClick={() => setEditing(true)}>{value ? Number(value).toLocaleString() : "0"}</button>
  return <Input autoFocus inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9.]/g, ""))} onBlur={() => setEditing(false)} onKeyDown={(event) => { if (event.key === "Enter") setEditing(false) }} className="text-left tabular-nums" />
}

function FormattedNumberInput({ value, onChange, placeholder, className }: { value: string; onChange: (val: string) => void; placeholder?: string; className?: string }) {
  const [display, setDisplay] = useState(() => {
    if (!value) return ""
    const [intPart, decPart] = value.split(".")
    const formattedInt = (intPart ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt
  })

  useEffect(() => {
    if (!value) {
      setDisplay("")
      return
    }
    const [intPart, decPart] = value.split(".")
    const formattedInt = (intPart ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    const expected = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt
    setDisplay((current) => {
      if (current.replace(/[^0-9.]/g, "") === value) return current
      return expected
    })
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "")
    if (!raw) {
       setDisplay("")
       onChange("")
       return
    }
    const parts = raw.split(".")
    if (parts.length > 2) return
    const formattedInt = (parts[0] ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    setDisplay(parts[1] !== undefined ? `${formattedInt}.${parts[1]}` : formattedInt)
    onChange(raw)
  }

  return <Input type="text" inputMode="decimal" value={display} onChange={handleChange} placeholder={placeholder} className={className} />
}

function UploadZone({ files, onFiles, onRemove }: { files: File[]; onFiles: (files: File[]) => void; onRemove: (index: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return <div className="flex flex-col flex-1 gap-3"><Label>Images and documents</Label><div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onFiles(Array.from(event.dataTransfer.files)) }} onClick={() => inputRef.current?.click()} className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-8 text-center hover:bg-muted/40 transition-colors"><input ref={inputRef} hidden type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={(event) => onFiles(Array.from(event.target.files ?? []))} /><p className="text-sm font-semibold">Drag and drop files here</p><p className="mt-1 text-xs text-muted-foreground">Images, PDF, Word, and spreadsheet files</p></div>{files.length > 0 && <div className="grid gap-2">{files.map((file, index) => <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"><span className="flex min-w-0 items-center gap-3 truncate">{file.type.startsWith("image/") && <img src={URL.createObjectURL(file)} alt="" className="size-8 rounded object-cover" />}<span className="truncate">{file.name}</span></span><button type="button" className="text-destructive" onClick={(event) => { event.stopPropagation(); onRemove(index) }}>Remove</button></div>)}</div>}</div>
}
