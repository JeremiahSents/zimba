"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  createExpenseReceiptAction,
  createSupplierAction,
} from "@/app/admin/actions"
import { UploadZone } from "@/components/projects/upload-zone"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { DatePicker } from "@/components/shared/date-picker"
import { toApiExpenseStatus } from "@/lib/api/normalizers"
import { readExpenseDraft, storeExpenseDraft } from "@/lib/expense-draft-store"
import { formatCurrency } from "@/lib/format"
import {
  type NewSupplierValues,
  readStoredSuppliers,
  storeSupplier,
} from "@/lib/supplier-store"
import type { DashboardSource, ProjectDetailResponse } from "@/lib/types"
import { uploadZimbaFile } from "@/lib/upload-file"

function formatNumberInput(value: string) {
  if (!value) return ""
  const parts = value.split(".")
  parts[0] = (parts[0] ?? "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return parts.join(".")
}

type ReceiptItem = {
  id: number
  itemDetails: string
  taskName: string
  supplierName: string
  quantity: string
  rate: string
}

const CREATE_SUPPLIER = "__create_supplier__"
const CREATE_TASK = "__create_task__"

export function ProjectExpenseCreatePage({
  project,
  source,
}: {
  project: ProjectDetailResponse
  source: DashboardSource
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draft = readExpenseDraft(project.id)
  const [date, setDate] = useState(
    () => draft?.date ?? new Date().toISOString().slice(0, 10)
  )
  const [status, setStatus] = useState<"Partial" | "Full" | "Not paid">(
    () => draft?.status ?? "Full"
  )
  const [amountPaid, setAmountPaid] = useState(() => draft?.amountPaid ?? "")
  const [files, setFiles] = useState<File[]>([])
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false)
  const [supplierItemId, setSupplierItemId] = useState<number | null>(null)
  const [supplierValues, setSupplierValues] = useState<NewSupplierValues>({
    name: "",
    category: "materials",
    companyContact: "",
    contactName: "",
    phone: "",
    email: "",
    notes: "",
  })
  const [supplierSaving, setSupplierSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const supplierOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...project.suppliers.map((supplier) => supplier.name),
          ...project.expenses.map((expense) => expense.supplier_name),
          ...readStoredSuppliers().map((supplier) => supplier.name),
        ])
      ).filter(Boolean),
    [project.expenses, project.suppliers]
  )
  const [items, setItems] = useState<ReceiptItem[]>(
    () =>
      draft?.items ?? [
        {
          id: 1,
          itemDetails: "",
          taskName: project.tasks[0]?.name ?? "",
          supplierName: supplierOptions[0] ?? "",
          quantity: "1",
          rate: "",
        },
      ]
  )

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0) * Number(item.rate || 0),
        0
      ),
    [items]
  )
  const projectHref = `/admin/projects/${project.id}`
  const expenseHref = `${projectHref}/expenses/new`

  useEffect(() => {
    storeExpenseDraft(project.id, { date, items, status, amountPaid })
  }, [amountPaid, date, items, project.id, status])

  useEffect(() => {
    const itemId = Number(searchParams.get("item"))
    const supplier = searchParams.get("supplier")
    const task = searchParams.get("task")
    if (!Number.isInteger(itemId) || (!supplier && !task)) return
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...(supplier ? { supplierName: supplier } : {}),
              ...(task ? { taskName: task } : {}),
            }
          : item
      )
    )
  }, [searchParams])

  function beginCreate(kind: "supplier" | "task", itemId: number) {
    if (kind === "supplier") {
      setSupplierItemId(itemId)
      setSupplierDialogOpen(true)
      return
    }
    const returnTo = `${expenseHref}?item=${itemId}`
    const destination =
      kind === "supplier"
        ? `/admin/suppliers/new?returnTo=${encodeURIComponent(returnTo)}`
        : `${projectHref}/tasks/new?returnTo=${encodeURIComponent(returnTo)}`
    router.push(destination)
  }

  function updateItem(
    id: number,
    key: Exclude<keyof ReceiptItem, "id">,
    value: string
  ) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    )
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((item) => item.id)) + 1,
        itemDetails: "",
        taskName: project.tasks[0]?.name ?? "",
        supplierName: supplierOptions[0] ?? "",
        quantity: "1",
        rate: "",
      },
    ])
  }

  function removeItem(id: number) {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      !date ||
      items.length === 0 ||
      items.some(
        (item) =>
          !item.supplierName ||
          !item.taskName ||
          !item.itemDetails.trim() ||
          Number(item.quantity) <= 0 ||
          Number(item.rate) < 0
      )
    ) {
      setError("Complete every required receipt field.")
      return
    }
    if (
      status === "Partial" &&
      (Number(amountPaid) <= 0 || Number(amountPaid) > total)
    ) {
      setError(
        "Enter an amount paid greater than zero and no more than the receipt total."
      )
      return
    }

    setSubmitting(true)
    setError("")
    let receiptFileId: string | undefined
    try {
      if (files[0]) {
        receiptFileId = await uploadZimbaFile(files[0], "expense_receipt")
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The receipt file could not be uploaded."
      )
      setSubmitting(false)
      return
    }

    const result = await createExpenseReceiptAction(project.id, {
      expense_date: date,
      items: items.map((item) => ({
        allocation_id:
          project.tasks.find((task) => task.name === item.taskName)?.id ?? 0,
        item_description: item.itemDetails.trim(),
        quantity: Number(item.quantity),
        supplier_name: item.supplierName,
        unit_rate: Number(item.rate),
      })),
      payment_status: toApiExpenseStatus(status),
      amount_paid:
        status === "Partial"
          ? Number(amountPaid)
          : status === "Full"
            ? total
            : 0,
      receipt_file_id: receiptFileId,
    })
    if (!result.ok) {
      setError(result.error)
      setSubmitting(false)
    }
  }

  return (
    <DashboardShell
      title="New expense"
      subtitle={`Create a receipt for ${project.name}.`}
      focusedTask
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
            <Link
              href="/admin/projects"
              className="font-semibold text-primary hover:underline"
            >
              Projects
            </Link>
            <span>/</span>
            <Link
              href={projectHref}
              className="font-semibold text-primary hover:underline"
            >
              {project.name}
            </Link>
            <span>/</span>
            <span>New expense</span>
          </div>
          <h2 className="font-heading font-semibold text-2xl tracking-tight">
            New expense receipt
          </h2>
          <p className="mt-1 text-muted-foreground text-xs">
            Record a one-off purchase for {project.name}.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-6">
        {error && (
          <p className="font-medium text-destructive text-xs" role="alert">
            {error}
          </p>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-base">
              Receipt details
            </CardTitle>
            <CardDescription>
              The project is fixed because this expense started from its page.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-4">
            <div className="grid gap-2 md:col-span-2">
              <Label>Project</Label>
              <div className="flex h-10 items-center rounded-[10px] border bg-muted/30 px-4 font-semibold text-sm">
                {project.name}
              </div>
            </div>
            <label className="grid gap-2">
              <Label>Expense date</Label>
              <DatePicker value={date} onChange={setDate} />
            </label>
            <label className="grid gap-2">
              <Label>Payment status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(
                    (value as "Partial" | "Full" | "Not paid") ?? "Full"
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Not paid">Not paid</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-base">
              Receipt attachment
            </CardTitle>
            <CardDescription>
              Upload an image or document for this receipt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadZone
              files={files}
              onFiles={(incoming) =>
                setFiles((current) => [...current, ...incoming].slice(0, 8))
              }
              onRemove={(index) =>
                setFiles((current) => current.filter((_, i) => i !== index))
              }
            />
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-5">
            <CardTitle className="font-semibold text-base">
              Item table
            </CardTitle>
            <CardDescription>
              Add the item purchased and its unit cost.
            </CardDescription>
            <CardAction>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                + Add item
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="p-0 md:overflow-x-auto">
            <div className="space-y-3 p-4 md:hidden">
              {items.map((item, index) => {
                const amount =
                  Number(item.quantity || 0) * Number(item.rate || 0)
                return (
                  <details
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border bg-background"
                  >
                    <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4">
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 font-semibold text-primary text-xs">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-sm">
                          {item.itemDetails || `Expense item ${index + 1}`}
                        </span>
                        <span className="mt-0.5 block text-muted-foreground text-xs">
                          {item.taskName || "Choose a project task"}
                        </span>
                      </span>
                      <span className="shrink-0 font-heading font-semibold text-sm tabular-nums">
                        {formatCurrency(amount)}
                      </span>
                    </summary>
                    <div className="grid gap-4 border-t p-4">
                      <label className="grid gap-2 font-medium text-xs">
                        Item details
                        <Input
                          required
                          value={item.itemDetails}
                          onChange={(event) =>
                            updateItem(
                              item.id,
                              "itemDetails",
                              event.target.value
                            )
                          }
                          placeholder="Type the purchased item"
                        />
                      </label>
                      <label className="grid gap-2 font-medium text-xs">
                        Project task
                        <Select
                          value={item.taskName}
                          onValueChange={(value) => {
                            if (value === CREATE_TASK) {
                              beginCreate("task", item.id)
                              return
                            }
                            updateItem(item.id, "taskName", value ?? "")
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select task" />
                          </SelectTrigger>
                          <SelectContent>
                            {project.tasks.map((task) => (
                              <SelectItem key={task.id} value={task.name}>
                                {task.name}
                              </SelectItem>
                            ))}
                            <SelectItem value={CREATE_TASK}>
                              + Create new task
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </label>
                      <label className="grid gap-2 font-medium text-xs">
                        Supplier
                        <Select
                          value={item.supplierName}
                          onValueChange={(value) => {
                            if (value === CREATE_SUPPLIER) {
                              beginCreate("supplier", item.id)
                              return
                            }
                            updateItem(item.id, "supplierName", value ?? "")
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {supplierOptions.map((supplier) => (
                              <SelectItem key={supplier} value={supplier}>
                                {supplier}
                              </SelectItem>
                            ))}
                            <SelectItem value={CREATE_SUPPLIER}>
                              + Create new supplier
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="grid gap-2 font-medium text-xs">
                          Quantity
                          <Input
                            required
                            type="text"
                            inputMode="decimal"
                            value={formatNumberInput(item.quantity)}
                            onChange={(event) => {
                              const raw = event.target.value.replace(/,/g, "")
                              if (/^\d*\.?\d*$/.test(raw)) {
                                updateItem(item.id, "quantity", raw)
                              }
                            }}
                          />
                        </label>
                        <label className="grid gap-2 font-medium text-xs">
                          Rate
                          <Input
                            required
                            type="text"
                            inputMode="decimal"
                            value={formatNumberInput(item.rate)}
                            onChange={(event) => {
                              const raw = event.target.value.replace(/,/g, "")
                              if (/^\d*\.?\d*$/.test(raw)) {
                                updateItem(item.id, "rate", raw)
                              }
                            }}
                            placeholder="0"
                          />
                        </label>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-muted/45 px-4 py-3">
                        <span className="text-muted-foreground text-xs">
                          Item amount
                        </span>
                        <span className="font-heading font-semibold text-base tabular-nums">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="destructive"
                          className="w-full"
                          disabled={items.length === 1}
                          onClick={() => removeItem(item.id)}
                        >
                          Remove item
                        </Button>
                        <Button
                          type="button"
                          className="w-full"
                          onClick={(e) => {
                            const details = (e.target as HTMLElement).closest(
                              "details"
                            )
                            if (details) details.removeAttribute("open")
                          }}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </details>
                )
              })}
            </div>
            <div className="hidden min-w-[880px] md:block">
              <div className="grid grid-cols-[minmax(10rem,1.1fr)_9rem_minmax(13rem,1.2fr)_5.5rem_8rem_8rem_3rem] border-b bg-muted/30 font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
                <div className="px-5 py-3">Item details</div>
                <div className="border-l px-4 py-3">Project task</div>
                <div className="border-l px-4 py-3">Supplier</div>
                <div className="border-l px-3 py-3 text-right">Quantity</div>
                <div className="border-l px-3 py-3 text-right">Rate</div>
                <div className="border-l px-3 py-3 text-right">Amount</div>
                <div className="border-l" />
              </div>
              {items.map((item, index) => {
                const amount =
                  Number(item.quantity || 0) * Number(item.rate || 0)
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[minmax(10rem,1.1fr)_9rem_minmax(13rem,1.2fr)_5.5rem_8rem_8rem_3rem] items-stretch border-b last:border-b-0"
                  >
                    <div>
                      <Input
                        required
                        value={item.itemDetails}
                        onChange={(event) =>
                          updateItem(item.id, "itemDetails", event.target.value)
                        }
                        placeholder="Type the purchased item"
                        aria-label={`Item ${index + 1} details`}
                        className="rounded-none border-0 bg-transparent px-4 focus-visible:border-transparent focus-visible:bg-muted/25 focus-visible:ring-0"
                      />
                    </div>
                    <div className="border-l">
                      <Select
                        value={item.taskName}
                        onValueChange={(value) => {
                          if (value === CREATE_TASK) {
                            beginCreate("task", item.id)
                            return
                          }
                          updateItem(item.id, "taskName", value ?? "")
                        }}
                      >
                        <SelectTrigger
                          className="w-full rounded-none border-0 bg-transparent px-4 focus-visible:border-transparent focus-visible:bg-muted/25 focus-visible:ring-0"
                          aria-label={`Item ${index + 1} project task`}
                        >
                          <SelectValue placeholder="Select task" />
                        </SelectTrigger>
                        <SelectContent>
                          {project.tasks.map((task) => (
                            <SelectItem key={task.id} value={task.name}>
                              {task.name}
                            </SelectItem>
                          ))}
                          <SelectItem value={CREATE_TASK}>
                            + Create new task
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border-l">
                      <Select
                        value={item.supplierName}
                        onValueChange={(value) => {
                          if (value === CREATE_SUPPLIER) {
                            beginCreate("supplier", item.id)
                            return
                          }
                          updateItem(item.id, "supplierName", value ?? "")
                        }}
                      >
                        <SelectTrigger
                          className="w-full rounded-none border-0 bg-transparent px-4 focus-visible:border-transparent focus-visible:bg-muted/25 focus-visible:ring-0"
                          aria-label={`Item ${index + 1} supplier`}
                        >
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {supplierOptions.map((supplier) => (
                            <SelectItem key={supplier} value={supplier}>
                              {supplier}
                            </SelectItem>
                          ))}
                          <SelectItem value={CREATE_SUPPLIER}>
                            + Create new supplier
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border-l">
                      <Input
                        required
                        min="0.01"
                        step="0.01"
                        type="number"
                        inputMode="decimal"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(item.id, "quantity", event.target.value)
                        }
                        aria-label={`Item ${index + 1} quantity`}
                        className="rounded-none border-0 bg-transparent px-3 text-right tabular-nums focus-visible:border-transparent focus-visible:bg-muted/25 focus-visible:ring-0"
                      />
                    </div>
                    <div className="border-l">
                      <Input
                        required
                        min="0"
                        step="0.01"
                        type="number"
                        inputMode="decimal"
                        value={item.rate}
                        onChange={(event) =>
                          updateItem(item.id, "rate", event.target.value)
                        }
                        placeholder="0"
                        aria-label={`Item ${index + 1} rate`}
                        className="rounded-none border-0 bg-transparent px-3 text-right tabular-nums focus-visible:border-transparent focus-visible:bg-muted/25 focus-visible:ring-0"
                      />
                    </div>
                    <div className="flex items-center justify-end border-l bg-muted/15 px-3 py-3 font-heading font-semibold text-sm tabular-nums">
                      {formatCurrency(amount)}
                    </div>
                    <div className="flex items-center justify-center border-l p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={items.length === 1}
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove item ${index + 1}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t py-5">
            <div className="w-full max-w-xs">
              <div className="flex items-center justify-between gap-5">
                <span className="font-medium text-muted-foreground text-xs">
                  Receipt total
                </span>
                <span className="font-heading font-semibold text-xl tabular-nums tracking-tight">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-semibold text-base">
              Payment summary
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground text-xs">Receipt total</p>
              <p className="font-semibold">{formatCurrency(total)}</p>
            </div>
            {status === "Partial" && (
              <label className="grid gap-2">
                <Label>Amount paid</Label>
                <Input
                  inputMode="decimal"
                  value={amountPaid}
                  onChange={(e) =>
                    setAmountPaid(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  placeholder="0"
                />
              </label>
            )}
            <div>
              <p className="text-muted-foreground text-xs">Payment status</p>
              <p className="font-semibold">
                {status === "Partial"
                  ? `Partial · ${formatCurrency(Math.max(total - Number(amountPaid || 0), 0))} remaining`
                  : status}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t bg-background/96 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-18px_45px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:static sm:flex sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
          <Button
            type="button"
            variant="outline"
            nativeButton={false}
            render={<Link href={projectHref} />}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save expense"}
          </Button>
        </div>
      </form>
      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create supplier</DialogTitle>
            <DialogDescription>
              Add a supplier without leaving this receipt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="Company name"
              value={supplierValues.name}
              onChange={(e) =>
                setSupplierValues((v) => ({ ...v, name: e.target.value }))
              }
            />
            <Input
              placeholder="Phone (+256...)"
              inputMode="tel"
              maxLength={16}
              value={supplierValues.phone}
              onChange={(e) =>
                setSupplierValues((v) => ({
                  ...v,
                  phone: e.target.value.replace(/[^0-9+ ]/g, "").slice(0, 16),
                }))
              }
            />
            <Select
              value={supplierValues.category}
              onValueChange={(value) =>
                setSupplierValues((v) => ({
                  ...v,
                  category: (value ??
                    "materials") as NewSupplierValues["category"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["materials", "labour", "equipment", "services", "other"].map(
                  (value) => (
                    <SelectItem key={value} value={value}>
                      {value[0].toUpperCase() + value.slice(1)}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSupplierDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={supplierSaving || !supplierValues.name.trim()}
              onClick={async () => {
                setSupplierSaving(true)
                const result = await createSupplierAction(supplierValues)
                if (result.ok) {
                  storeSupplier(supplierValues)
                  if (supplierItemId !== null)
                    updateItem(
                      supplierItemId,
                      "supplierName",
                      supplierValues.name.trim()
                    )
                  setSupplierDialogOpen(false)
                  setSupplierValues({
                    name: "",
                    category: "materials",
                    companyContact: "",
                    contactName: "",
                    phone: "",
                    email: "",
                    notes: "",
                  })
                } else setError(result.error)
                setSupplierSaving(false)
              }}
            >
              {supplierSaving ? "Saving…" : "Create supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
