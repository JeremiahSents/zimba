"use client"

import { Delete02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { ErrorNotice } from "@/components/shared/error-notice"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { createProjectAction } from "@/core/projects/actions"
import type { PublicError } from "@/core/shared/errors"
import { formatCurrency } from "@/lib/format"
import {
  clearProjectCreateDraft,
  defaultInitialAllocations,
  type InitialAllocation,
  initialAllocationTotal,
  readProjectCreateDraft,
  writeProjectCreateDraft,
} from "@/lib/project-create-draft"

function persistRows(rows: InitialAllocation[]) {
  const draft = readProjectCreateDraft()
  if (draft) writeProjectCreateDraft({ ...draft, allocations: rows })
}

function MobileAllocationCards({
  rows,
  total,
  onUpdate,
  onRemove,
}: {
  rows: InitialAllocation[]
  total: number
  onUpdate: (id: number, field: "name" | "amount", value: string) => void
  onRemove: (id: number) => void
}) {
  return (
    <div className="space-y-3 p-4 md:hidden">
      {rows.map((row, index) => (
        <div key={row.id} className="rounded-2xl border bg-background p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.08em]">
              Allocation {index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(row.id)}
              aria-label={`Remove ${row.name || "allocation item"}`}
              className="text-muted-foreground hover:text-destructive"
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.8} />
            </Button>
          </div>
          <label className="grid gap-2 font-medium text-xs">
            Item name
            <input
              value={row.name}
              onChange={(event) => onUpdate(row.id, "name", event.target.value)}
              placeholder="e.g. Materials"
              className="h-11 rounded-[10px] border bg-card px-4 font-normal text-base outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
            />
          </label>
          <label className="mt-4 grid gap-2 font-medium text-xs">
            Initial allocation
            <input
              inputMode="decimal"
              value={formatNumberInput(row.amount)}
              onChange={(event) =>
                onUpdate(
                  row.id,
                  "amount",
                  sanitizeNumberInput(event.target.value)
                )
              }
              placeholder="0"
              className="h-11 rounded-[10px] border bg-card px-4 text-right font-normal text-base tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
            />
          </label>
        </div>
      ))}
      {!rows.length ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground text-sm">
          Add an item to start the project allocation.
        </div>
      ) : null}
      <div className="flex items-center justify-between rounded-2xl bg-primary/8 px-4 py-4">
        <span className="font-medium text-muted-foreground text-xs">
          Total allocation
        </span>
        <span className="font-heading font-semibold text-lg text-primary tabular-nums">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  )
}

export function ProjectAllocationCreatePage() {
  const router = useRouter()
  const slug = useWorkspaceSlug()
  const [rows, setRows] = useState<InitialAllocation[]>(
    defaultInitialAllocations
  )
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<PublicError | string>("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const draft = readProjectCreateDraft()
    if (!draft || !hasCompleteDetails(draft.details)) {
      setError("Project details are missing. Go back and complete them first.")
      setReady(true)
      return
    }
    setRows(
      draft.allocations.length ? draft.allocations : defaultInitialAllocations
    )
    setReady(true)
  }, [])

  const total = initialAllocationTotal(rows)

  function updateRow(id: number, field: "name" | "amount", value: string) {
    const nextRows = rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    )
    setRows(nextRows)
    persistRows(nextRows)
    setError("")
  }

  function addRow() {
    const nextRows = [...rows, { id: Date.now(), name: "", amount: "" }]
    setRows(nextRows)
    persistRows(nextRows)
  }

  function removeRow(id: number) {
    const nextRows = rows.filter((row) => row.id !== id)
    setRows(nextRows)
    persistRows(nextRows)
  }

  function saveDraftAndGoBack() {
    persistRows(rows)
    router.push(`/${slug}/projects/new`)
  }

  async function createProject() {
    const draft = readProjectCreateDraft()
    if (!draft || !hasCompleteDetails(draft.details)) {
      router.replace(`/${slug}/projects/new`)
      return
    }
    if (!rows.length || rows.some((row) => !row.name.trim())) {
      setError("Add a name for every allocation item.")
      return
    }
    if (total <= 0) {
      setError("Enter an initial allocation greater than zero.")
      return
    }
    if (rows.some((row) => Number(row.amount) <= 0)) {
      setError("Enter an allocation greater than zero for every item.")
      return
    }

    setSubmitting(true)
    setError("")
    const result = await createProjectAction({
      allocations: rows.map((row) => ({
        budget: Number(row.amount),
        name: row.name.trim(),
      })),
      attachment_ids: draft.attachmentIds ?? [],
      building_type: normalizeBuildingType(draft.details.buildingType),
      land_size: draft.details.landSize.trim(),
      location: draft.details.location.trim(),
      name: draft.details.name.trim(),
    })
    if (!result.success) {
      setError(result.error)
      setSubmitting(false)
      return
    }
    clearProjectCreateDraft()
  }

  if (!ready) return null

  return (
    <DashboardShell title="New project" subtitle="" focusedTask>
      <div className="grid gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${slug}/projects`}>
                    Projects
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/${slug}/projects/new`}>
                    Project details
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Initial allocation</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <h2 className="mt-2 font-heading font-semibold text-xl">
              Set the initial allocation
            </h2>
            <p className="mt-1 text-muted-foreground text-xs">
              Add the starting budget items for this project.
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Button
              type="button"
              variant="secondary"
              onClick={saveDraftAndGoBack}
              disabled={submitting}
            >
              Back
            </Button>
            <Button type="button" onClick={createProject} disabled={submitting}>
              {submitting ? "Creating..." : "Create project"}
            </Button>
          </div>
        </div>

        {error && <ErrorNotice error={error} />}

        <Card className="gap-0 overflow-hidden py-0">
          <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
            <div>
              <h3 className="font-heading font-semibold text-base">
                Initial allocation
              </h3>
              <p className="mt-1 text-muted-foreground text-xs">
                Set the opening amount for each budget item.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addRow}
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
              Add item
            </Button>
          </div>

          <MobileAllocationCards
            rows={rows}
            total={total}
            onUpdate={updateRow}
            onRemove={removeRow}
          />

          <div className="hidden md:block [&_[data-slot=table-container]]:overflow-x-hidden">
            <Table className="table-fixed">
              <TableHeader className="bg-muted/25">
                <TableRow>
                  <TableHead className="w-[62%] px-5">Item name</TableHead>
                  <TableHead className="w-[30%] border-l px-5 text-right">
                    Initial allocation
                  </TableHead>
                  <TableHead className="w-[8%] border-l">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="px-5 py-2">
                      <input
                        value={row.name}
                        onChange={(event) =>
                          updateRow(row.id, "name", event.target.value)
                        }
                        placeholder="e.g. Materials"
                        aria-label="Allocation item name"
                        className="h-10 w-full bg-transparent outline-none placeholder:text-muted-foreground"
                      />
                    </TableCell>
                    <TableCell className="border-l px-5 py-2">
                      <input
                        inputMode="decimal"
                        value={formatNumberInput(row.amount)}
                        onChange={(event) =>
                          updateRow(
                            row.id,
                            "amount",
                            sanitizeNumberInput(event.target.value)
                          )
                        }
                        placeholder="0"
                        aria-label={`Initial allocation for ${row.name || "item"}`}
                        className="h-10 w-full bg-transparent text-right tabular-nums outline-none placeholder:text-muted-foreground"
                      />
                    </TableCell>
                    <TableCell className="border-l p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        aria-label={`Remove ${row.name || "allocation item"}`}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.8} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {!rows.length && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Add an item to start the project allocation.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="px-5 py-4 text-right font-medium text-muted-foreground">
                    Total initial allocation
                  </TableCell>
                  <TableCell className="border-l px-5 py-4 text-right font-heading font-semibold text-lg tabular-nums">
                    {formatCurrency(total)}
                  </TableCell>
                  <TableCell className="border-l" />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </Card>
        <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t bg-background/96 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-18px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:hidden">
          <Button
            type="button"
            variant="secondary"
            onClick={saveDraftAndGoBack}
            disabled={submitting}
          >
            Back
          </Button>
          <Button type="button" onClick={createProject} disabled={submitting}>
            {submitting ? "Creating..." : "Create project"}
          </Button>
        </div>
      </div>
    </DashboardShell>
  )
}

function hasCompleteDetails(details: {
  name: string
  location: string
  landSize: string
  buildingType: string
}) {
  return Boolean(
    details.name.trim() &&
      details.location.trim() &&
      details.landSize.trim() &&
      details.buildingType
  )
}

function sanitizeNumberInput(value: string) {
  const raw = value.replace(/[^0-9.]/g, "")
  return raw.split(".").length > 2 ? raw.slice(0, -1) : raw
}

function formatNumberInput(value: string) {
  if (!value) return ""
  const [integer, decimal] = value.split(".")
  const formatted = Number(integer || 0).toLocaleString("en-UG")
  return decimal === undefined ? formatted : `${formatted}.${decimal}`
}

function normalizeBuildingType(value: string) {
  return value.trim().toLowerCase().replaceAll(" ", "_")
}
