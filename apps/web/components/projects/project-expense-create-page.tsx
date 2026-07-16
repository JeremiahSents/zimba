"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
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
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { createPayableExpenseAction } from "@/app/admin/actions"
import { UploadZone } from "@/components/projects/upload-zone"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { DatePicker } from "@/components/shared/date-picker"
import { useWorkspace } from "@/components/shared/workspace-context"
import { formatCurrency, formatShortDate } from "@/lib/format"
import type {
  DashboardSource,
  ProjectDetailResponse,
  SupplierResponse,
} from "@/lib/types"
import { uploadZimbaFile } from "@/lib/upload-file"

type ExpenseLine = {
  id: number
  allocationId: string
  description: string
  quantity: string
  unitAmount: string
}
type Props = {
  project: ProjectDetailResponse
  vendors: SupplierResponse[]
  source: DashboardSource
}

const makeLine = (id: number, allocationId?: number): ExpenseLine => ({
  id,
  allocationId: allocationId ? String(allocationId) : "",
  description: "",
  quantity: "1",
  unitAmount: "",
})

function formatNumericInput(value: string) {
  if (!value) return ""
  return Number(value).toLocaleString("en-US")
}

export function ProjectExpenseCreatePage({ project, vendors }: Props) {
  const router = useRouter()
  const workspace = useWorkspace()
  const today = new Date().toISOString().slice(0, 10)
  const [supplierId, setSupplierId] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(today)
  const [files, setFiles] = useState<File[]>([])
  const [lines, setLines] = useState([makeLine(1, project.tasks[0]?.id)])
  const [amountPaid, setAmountPaid] = useState("")
  const [paymentDate, setPaymentDate] = useState(today)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [paymentReference, setPaymentReference] = useState("")
  const [mobileStep, setMobileStep] = useState<"entry" | "preview">("entry")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const suppliers = useMemo(
    () =>
      vendors.filter(
        (vendor): vendor is SupplierResponse & { id: number } =>
          typeof vendor.id === "number"
      ),
    [vendors]
  )
  const selectedSupplier = suppliers.find(
    (vendor) => String(vendor.id) === supplierId
  )
  const total = lines.reduce(
    (sum, line) =>
      sum + Number(line.quantity || 0) * Number(line.unitAmount || 0),
    0
  )
  const paid = Number(amountPaid || 0)
  const outstanding = Math.max(total - paid, 0)
  const paymentStatus =
    paid <= 0 ? "Unpaid" : paid < total ? "Partially paid" : "Paid in full"
  const paymentStatusClass =
    paymentStatus === "Paid in full"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : paymentStatus === "Partially paid"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-100 text-slate-600"
  const projectHref = `/admin/projects/${project.id}`

  function updateLine(
    id: number,
    field: Exclude<keyof ExpenseLine, "id">,
    value: string
  ) {
    setLines((current) =>
      current.map((line) =>
        line.id === id ? { ...line, [field]: value } : line
      )
    )
  }

  function validateReceiptDetails() {
    if (
      !supplierId ||
      !purchaseDate ||
      lines.some(
        (line) =>
          !line.allocationId ||
          !line.description.trim() ||
          Number(line.quantity) <= 0 ||
          Number(line.unitAmount) < 0
      )
    ) {
      setError("Choose a supplier and complete every item.")
      return false
    }
    return true
  }

  function continueToPreview() {
    if (!validateReceiptDetails()) return
    setError("")
    setMobileStep("preview")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function saveReceipt() {
    if (!validateReceiptDetails()) return
    if (paid > total) {
      setError("Amount paid cannot exceed the receipt total.")
      return
    }
    if (paid > 0 && (!paymentDate || !paymentMethod)) {
      setError("Add the payment date and method.")
      return
    }

    setSaving(true)
    setError("")
    let receiptFileId: string | undefined
    try {
      if (files[0])
        receiptFileId = await uploadZimbaFile(files[0], "expense_receipt")
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The receipt could not be uploaded."
      )
      setSaving(false)
      return
    }

    const result = await createPayableExpenseAction({
      project_id: project.id,
      supplier_id: Number(supplierId),
      currency: project.currency ?? "UGX",
      receipt_file_id: receiptFileId,
      expense_date: purchaseDate,
      due_date: purchaseDate,
      lifecycle_status: "incurred",
      submit_for_approval: true,
      record_as_receipt: true,
      amount_paid: paid,
      payment_date: paid > 0 ? paymentDate : undefined,
      payment_method: paid > 0 ? paymentMethod : undefined,
      payment_reference: paymentReference.trim() || undefined,
      lines: lines.map((line) => ({
        allocation_id: Number(line.allocationId),
        description: line.description.trim(),
        quantity: Number(line.quantity),
        unit_amount: Number(line.unitAmount),
      })),
    })
    if (!result.ok) {
      setError(result.error)
      setSaving(false)
      return
    }
    router.push(projectHref)
    router.refresh()
  }

  return (
    <DashboardShell title="New receipt" subtitle={project.name} focusedTask>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
            <Link
              href={projectHref}
              className="font-semibold text-primary hover:underline"
            >
              {project.name}
            </Link>
            <span>/</span>
            <span>New receipt</span>
          </div>
          <h2 className="font-heading font-semibold text-2xl tracking-tight">
            Create receipt
          </h2>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={projectHref} />}
          >
            Cancel
          </Button>
          <Button onClick={saveReceipt} disabled={saving}>
            {saving ? "Saving…" : "Save receipt"}
          </Button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 font-medium text-destructive text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid items-start gap-5 pb-20 md:pb-0 lg:grid-cols-[minmax(0,3fr)_minmax(22rem,2fr)]">
        <div
          className={`${mobileStep === "preview" ? "hidden md:grid" : "grid"} gap-5`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Receipt details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 sm:col-span-2">
                <Label>Supplier</Label>
                <Select
                  value={supplierId}
                  onValueChange={(value) => setSupplierId(value ?? "")}
                >
                  <SelectTrigger className="h-12 w-full px-4 text-base md:h-12 md:text-base">
                    <SelectValue placeholder="Choose supplier">
                      {selectedSupplier?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem
                        key={supplier.id}
                        value={String(supplier.id)}
                        className="min-h-11 px-3 py-2 text-sm md:min-h-10 md:px-3 md:py-2 md:text-sm"
                      >
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {suppliers.length === 0 && (
                  <Link
                    href="/admin/suppliers/new"
                    className="font-medium text-primary text-xs hover:underline"
                  >
                    + Create supplier
                  </Link>
                )}
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <Label>Purchase date</Label>
                <DatePicker value={purchaseDate} onChange={setPurchaseDate} />
              </label>
              <div className="sm:col-span-2">
                <UploadZone
                  files={files}
                  onFiles={(incoming) => setFiles(incoming.slice(0, 1))}
                  onRemove={() => setFiles([])}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden py-0">
            <CardHeader className="border-b py-5">
              <CardTitle className="text-base">Items purchased</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden grid-cols-[minmax(10rem,1.4fr)_minmax(9rem,1fr)_5rem_8rem_8rem_3rem] bg-muted/35 font-semibold text-[10px] text-muted-foreground uppercase tracking-wide md:grid">
                <div className="px-3 py-2.5">Item</div>
                <div className="border-l px-3 py-2.5">Category</div>
                <div className="border-l px-2 py-2.5 text-right">Qty</div>
                <div className="border-l px-2 py-2.5 text-right">Rate</div>
                <div className="border-l px-2 py-2.5 text-right">Amount</div>
                <div className="border-l" />
              </div>
              <div className="grid gap-3 p-3 md:hidden">
                {lines.map((line, index) => {
                  const amount =
                    Number(line.quantity || 0) * Number(line.unitAmount || 0)
                  return (
                    <div
                      key={line.id}
                      className="overflow-hidden rounded-xl border bg-background"
                    >
                      <div className="flex min-h-11 items-center justify-between border-b bg-muted/25 px-3">
                        <span className="font-semibold text-sm">
                          Item {index + 1}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 px-2 text-muted-foreground"
                          disabled={lines.length === 1}
                          onClick={() =>
                            setLines((current) =>
                              current.filter((item) => item.id !== line.id)
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid gap-4 p-3">
                        <label className="grid gap-1.5">
                          <Label htmlFor={`item-${line.id}`}>Item</Label>
                          <Input
                            id={`item-${line.id}`}
                            value={line.description}
                            onChange={(event) =>
                              updateLine(
                                line.id,
                                "description",
                                event.target.value
                              )
                            }
                            placeholder="What was purchased?"
                          />
                        </label>
                        <label className="grid gap-1.5">
                          <Label>Category</Label>
                          <Select
                            value={line.allocationId}
                            onValueChange={(value) =>
                              updateLine(line.id, "allocationId", value ?? "")
                            }
                          >
                            <SelectTrigger className="h-11 w-full px-3 text-sm">
                              <SelectValue placeholder="Choose category">
                                {
                                  project.tasks.find(
                                    (task) =>
                                      String(task.id) === line.allocationId
                                  )?.name
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {project.tasks.map((task) => (
                                <SelectItem
                                  key={task.id}
                                  value={String(task.id)}
                                  className="min-h-11 px-3 py-2 text-sm"
                                >
                                  {task.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </label>
                        <div className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-3">
                          <label className="grid gap-1.5">
                            <Label htmlFor={`quantity-${line.id}`}>
                              Quantity
                            </Label>
                            <Input
                              id={`quantity-${line.id}`}
                              inputMode="numeric"
                              value={line.quantity}
                              onChange={(event) =>
                                updateLine(
                                  line.id,
                                  "quantity",
                                  event.target.value.replace(/\D/g, "")
                                )
                              }
                              className="text-right"
                            />
                          </label>
                          <label className="grid gap-1.5">
                            <Label htmlFor={`rate-${line.id}`}>Rate</Label>
                            <Input
                              id={`rate-${line.id}`}
                              inputMode="numeric"
                              value={formatNumericInput(line.unitAmount)}
                              onChange={(event) =>
                                updateLine(
                                  line.id,
                                  "unitAmount",
                                  event.target.value.replace(/\D/g, "")
                                )
                              }
                              placeholder="0"
                              className="text-right"
                            />
                          </label>
                        </div>
                        <div className="flex min-h-11 items-center justify-between rounded-lg bg-muted/35 px-3 text-sm">
                          <span className="text-muted-foreground">Amount</span>
                          <strong>{formatCurrency(amount)}</strong>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="hidden md:block">
                {lines.map((line, index) => {
                  const amount =
                    Number(line.quantity || 0) * Number(line.unitAmount || 0)
                  return (
                    <div
                      key={line.id}
                      className="grid gap-3 border-t p-3 first:border-t-0 md:grid-cols-[minmax(10rem,1.4fr)_minmax(9rem,1fr)_5rem_8rem_8rem_3rem] md:gap-0 md:p-0"
                    >
                      <Input
                        value={line.description}
                        onChange={(event) =>
                          updateLine(line.id, "description", event.target.value)
                        }
                        placeholder={`Item ${index + 1}`}
                        className="md:rounded-none md:border-0 md:bg-transparent"
                      />
                      <Select
                        value={line.allocationId}
                        onValueChange={(value) =>
                          updateLine(line.id, "allocationId", value ?? "")
                        }
                      >
                        <SelectTrigger className="h-11 w-full px-3 text-sm md:h-11 md:rounded-none md:border-y-0 md:border-r-0 md:bg-transparent md:text-sm">
                          <SelectValue placeholder="Category">
                            {
                              project.tasks.find(
                                (task) => String(task.id) === line.allocationId
                              )?.name
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {project.tasks.map((task) => (
                            <SelectItem
                              key={task.id}
                              value={String(task.id)}
                              className="min-h-11 px-3 py-2 text-sm md:min-h-10 md:px-3 md:py-2 md:text-sm"
                            >
                              {task.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        inputMode="numeric"
                        value={line.quantity}
                        onChange={(event) =>
                          updateLine(
                            line.id,
                            "quantity",
                            event.target.value.replace(/\D/g, "")
                          )
                        }
                        className="text-right md:rounded-none md:border-y-0 md:border-r-0 md:bg-transparent"
                      />
                      <Input
                        inputMode="numeric"
                        value={formatNumericInput(line.unitAmount)}
                        onChange={(event) =>
                          updateLine(
                            line.id,
                            "unitAmount",
                            event.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="0"
                        className="text-right md:rounded-none md:border-y-0 md:border-r-0 md:bg-transparent"
                      />
                      <div className="flex items-center justify-between bg-muted/20 px-3 py-2 text-sm md:justify-end md:border-l">
                        <span className="text-muted-foreground md:hidden">
                          Amount
                        </span>
                        <strong>{formatCurrency(amount)}</strong>
                      </div>
                      <div className="flex justify-end md:items-center md:justify-center md:border-l">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={lines.length === 1}
                          onClick={() =>
                            setLines((current) =>
                              current.filter((item) => item.id !== line.id)
                            )
                          }
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between border-t p-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setLines((current) => [
                      ...current,
                      makeLine(
                        Math.max(...current.map((line) => line.id)) + 1,
                        project.tasks[0]?.id
                      ),
                    ])
                  }
                >
                  + Add item
                </Button>
                <strong className="font-heading text-lg">
                  {formatCurrency(total)}
                </strong>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <Label>Amount paid</Label>
                <Input
                  inputMode="numeric"
                  value={formatNumericInput(amountPaid)}
                  onChange={(event) =>
                    setAmountPaid(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="0"
                />
              </label>
              <div className="grid gap-2">
                <Label>Status</Label>
                <div className="flex h-10 items-center rounded-[10px] border bg-muted/20 px-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 font-semibold text-xs ${paymentStatusClass}`}
                  >
                    {paymentStatus}
                  </span>
                </div>
              </div>
              {paid > 0 && (
                <>
                  <label className="grid gap-2">
                    <Label>Payment date</Label>
                    <DatePicker value={paymentDate} onChange={setPaymentDate} />
                  </label>
                  <label className="grid gap-2">
                    <Label>Payment method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) =>
                        setPaymentMethod(value ?? "cash")
                      }
                    >
                      <SelectTrigger className="h-11 w-full px-3 text-sm md:h-11 md:text-sm">
                        <SelectValue>
                          {{
                            cash: "Cash",
                            bank_transfer: "Bank transfer",
                            mobile_money: "Mobile money",
                            cheque: "Cheque",
                          }[paymentMethod] ?? paymentMethod}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="cash"
                          className="min-h-11 px-3 py-2 text-sm md:min-h-10 md:px-3 md:py-2 md:text-sm"
                        >
                          Cash
                        </SelectItem>
                        <SelectItem
                          value="bank_transfer"
                          className="min-h-11 px-3 py-2 text-sm md:min-h-10 md:px-3 md:py-2 md:text-sm"
                        >
                          Bank transfer
                        </SelectItem>
                        <SelectItem
                          value="mobile_money"
                          className="min-h-11 px-3 py-2 text-sm md:min-h-10 md:px-3 md:py-2 md:text-sm"
                        >
                          Mobile money
                        </SelectItem>
                        <SelectItem
                          value="cheque"
                          className="min-h-11 px-3 py-2 text-sm md:min-h-10 md:px-3 md:py-2 md:text-sm"
                        >
                          Cheque
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <Label>Payment reference</Label>
                    <Input
                      value={paymentReference}
                      onChange={(event) =>
                        setPaymentReference(event.target.value)
                      }
                      placeholder="Optional"
                    />
                  </label>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <aside
          className={`${mobileStep === "entry" ? "hidden md:block" : "block"} h-full self-stretch`}
        >
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="border-b bg-muted/20 p-6">
              <p className="text-muted-foreground text-xs">EXPENSE RECEIPT</p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-heading font-semibold text-2xl">
                    {selectedSupplier?.name ?? "Supplier"}
                  </h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {project.name}
                  </p>
                </div>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 font-semibold text-orange-700 text-xs">
                  DRAFT
                </span>
              </div>
              <p className="mt-4 font-mono text-muted-foreground text-xs">
                Receipt #: Auto-generated on save
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl border bg-background/70 p-4 text-xs">
                <div>
                  <p className="font-semibold text-muted-foreground uppercase tracking-wide">
                    From
                  </p>
                  <p className="mt-1 font-semibold text-sm">
                    {selectedSupplier?.name ?? "Supplier"}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {selectedSupplier?.phone ||
                      selectedSupplier?.companyContact ||
                      "Supplier details"}
                  </p>
                </div>
                <div className="border-l pl-4">
                  <p className="font-semibold text-muted-foreground uppercase tracking-wide">
                    Billed to
                  </p>
                  <p className="mt-1 font-semibold text-sm">
                    {workspace.organizationName}
                  </p>
                  <p className="mt-1 text-muted-foreground">{project.name}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5 border-b p-6 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Purchase date</p>
                <p className="mt-1 font-medium">
                  {formatShortDate(purchaseDate)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs">Status</p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-2.5 py-1 font-semibold text-xs ${paymentStatusClass}`}
                >
                  {paymentStatus}
                </span>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_5.5rem] border-b pb-2 font-semibold text-[10px] text-muted-foreground uppercase">
                <span>Item</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Total</span>
              </div>
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="grid grid-cols-[minmax(0,1fr)_2.5rem_5.5rem] border-b py-3 text-xs"
                >
                  <span className="truncate pr-2">
                    {line.description || "New item"}
                  </span>
                  <span className="text-right tabular-nums">
                    {line.quantity || 0}
                  </span>
                  <span className="text-right font-medium tabular-nums">
                    {formatCurrency(
                      Number(line.quantity || 0) * Number(line.unitAmount || 0)
                    )}
                  </span>
                </div>
              ))}
              <div className="mt-auto grid w-full gap-2 pt-8 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <strong>{formatCurrency(total)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <strong>{formatCurrency(paid)}</strong>
                </div>
                <div className="mt-1 flex justify-between border-t pt-3 text-base">
                  <span>Outstanding</span>
                  <strong>{formatCurrency(outstanding)}</strong>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2 border-t bg-background/95 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        {mobileStep === "entry" ? (
          <>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={projectHref} />}
            >
              Cancel
            </Button>
            <Button onClick={continueToPreview}>Continue</Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setMobileStep("entry")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            >
              Back to edit
            </Button>
            <Button onClick={saveReceipt} disabled={saving}>
              {saving ? "Saving…" : "Save receipt"}
            </Button>
          </>
        )}
      </div>
    </DashboardShell>
  )
}
