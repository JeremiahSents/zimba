"use client"

import { Button } from "@workspace/ui/components/button"
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
import { useEffect, useMemo, useRef, useState } from "react"
import { CreateCategoryDialog } from "@/components/expenses/create-category-dialog"
import { PaymentPanel } from "@/components/expenses/payment-panel"
import {
  type ReceiptFormLine,
  ReceiptLineItems,
} from "@/components/expenses/receipt-line-items"
import { ReceiptPreview } from "@/components/expenses/receipt-preview"
import { UploadZone } from "@/components/projects/upload-zone"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { DatePicker } from "@/components/shared/date-picker"
import { ErrorNotice } from "@/components/shared/error-notice"
import { useWorkspaceSlug } from "@/components/shared/use-workspace-slug"
import { useWorkspace } from "@/components/shared/workspace-context"
import { createPayableExpenseAction } from "@/core/expenses/actions"
import { validateReceiptFile } from "@/core/expenses/receipt-file"
import { createProjectTaskAction } from "@/core/projects/actions"
import { ApplicationError, type PublicError } from "@/core/shared/errors"
import {
  deleteReceiptDraft,
  readReceiptDraft,
  writeReceiptDraft,
} from "@/lib/receipt-draft"
import type {
  ProjectDetailResponse,
  SupplierResponse,
  TaskResponse,
} from "@/lib/types"
import { uploadZimbaFile } from "@/lib/upload-file"

type Props = {
  project: ProjectDetailResponse
  vendors: SupplierResponse[]
}

const makeLine = (id: number, allocationId?: string): ReceiptFormLine => ({
  id,
  allocationId: allocationId ? String(allocationId) : "",
  description: "",
  quantity: "1",
  unitAmount: "",
})

const CREATE_CATEGORY_VALUE = "__create_new_category__"
export function ProjectExpenseCreatePage({ project, vendors }: Props) {
  const router = useRouter()
  const workspace = useWorkspace()
  const slug = useWorkspaceSlug()
  const today = new Date().toISOString().slice(0, 10)
  const [supplierId, setSupplierId] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(today)
  const [files, setFiles] = useState<File[]>([])
  const [uploadedReceiptFileId, setUploadedReceiptFileId] = useState<string>()
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "uploaded" | "error"
  >("idle")
  const uploadPromiseRef = useRef<Promise<string> | null>(null)
  const uploadFileRef = useRef<File | null>(null)
  const uploadAttemptRef = useRef(0)
  const submissionLockRef = useRef(false)
  const [categories, setCategories] = useState<TaskResponse[]>(project.tasks)
  const [lines, setLines] = useState([makeLine(1, project.tasks[0]?.id)])
  const [amountPaid, setAmountPaid] = useState("")
  const [paidInFull, setPaidInFull] = useState(false)
  const [customPaymentOpen, setCustomPaymentOpen] = useState(false)
  const [paymentDate, setPaymentDate] = useState(today)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [paymentReference, setPaymentReference] = useState("")
  const [mobileStep, setMobileStep] = useState<"entry" | "preview">("entry")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<PublicError | string>("")
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryLineId, setCategoryLineId] = useState<number | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [categoryBudget, setCategoryBudget] = useState("")
  const [categoryError, setCategoryError] = useState<PublicError | string>("")
  const [categoryPending, setCategoryPending] = useState(false)
  const draftReady = useRef(false)
  const draftKey = `project:${project.id}:new-receipt`

  useEffect(() => {
    readReceiptDraft<{
      supplierId: string
      purchaseDate: string
      lines: ReceiptFormLine[]
      amountPaid: string
      paymentDate: string
      paymentMethod: string
      paymentReference: string
    }>(draftKey)
      .then((draft) => {
        if (draft) {
          setSupplierId(draft.value.supplierId)
          setPurchaseDate(draft.value.purchaseDate)
          setLines(draft.value.lines)
          setAmountPaid(draft.value.amountPaid)
          setPaymentDate(draft.value.paymentDate)
          setPaymentMethod(draft.value.paymentMethod)
          setPaymentReference(draft.value.paymentReference)
          setFiles(draft.files)
        }
        draftReady.current = true
      })
      .catch(() => {
        draftReady.current = true
      })
  }, [draftKey])

  useEffect(() => {
    if (!draftReady.current) return
    const timer = window.setTimeout(
      () =>
        void writeReceiptDraft(
          draftKey,
          {
            supplierId,
            purchaseDate,
            lines,
            amountPaid,
            paymentDate,
            paymentMethod,
            paymentReference,
          },
          files
        ),
      350
    )
    return () => window.clearTimeout(timer)
  }, [
    draftKey,
    supplierId,
    purchaseDate,
    lines,
    amountPaid,
    paymentDate,
    paymentMethod,
    paymentReference,
    files,
  ])

  useEffect(() => {
    const file = files[0]
    if (!file) {
      uploadFileRef.current = null
      uploadPromiseRef.current = null
      setUploadedReceiptFileId(undefined)
      setUploadStatus("idle")
      return
    }
    if (uploadStatus === "error") return
    if (
      uploadFileRef.current === file &&
      (uploadedReceiptFileId || uploadPromiseRef.current)
    )
      return
    uploadFileRef.current = file
    setUploadedReceiptFileId(undefined)
    setUploadStatus("uploading")
    const attempt = ++uploadAttemptRef.current
    const promise = uploadZimbaFile(file, "expense_receipt")
    uploadPromiseRef.current = promise
    void promise
      .then((fileId) => {
        if (
          attempt === uploadAttemptRef.current &&
          uploadFileRef.current === file
        )
          setUploadedReceiptFileId(fileId)
        if (
          attempt === uploadAttemptRef.current &&
          uploadFileRef.current === file
        )
          setUploadStatus("uploaded")
      })
      .catch(() => {
        if (attempt === uploadAttemptRef.current) setUploadStatus("error")
        setError("The file could not be uploaded. You can try again.")
      })
      .finally(() => {
        if (attempt === uploadAttemptRef.current)
          uploadPromiseRef.current = null
      })
  }, [files, uploadedReceiptFileId, uploadStatus])

  function retryUpload() {
    const file = files[0]
    if (!file || uploadStatus === "uploading") return
    uploadFileRef.current = null
    uploadPromiseRef.current = null
    setUploadedReceiptFileId(undefined)
    setUploadStatus("idle")
  }

  function selectReceiptFiles(incoming: File[]) {
    const file = incoming[0]
    if (!file) return
    const validationMessage = validateReceiptFile(file)
    if (validationMessage) {
      setError(validationMessage)
      return
    }
    setError("")
    setUploadStatus("idle")
    setFiles([file])
    setUploadedReceiptFileId(undefined)
  }

  const suppliers = useMemo(
    () =>
      vendors.filter(
        (vendor): vendor is SupplierResponse & { id: string } =>
          typeof vendor.id === "string"
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
  const projectHref = `/${slug}/projects/${project.id}`

  useEffect(() => {
    if (!paidInFull) return
    setAmountPaid(total > 0 ? String(total) : "")
  }, [paidInFull, total])

  function togglePaidInFull(checked: boolean) {
    setPaidInFull(checked)
    setAmountPaid(checked ? String(total) : "")
    if (checked) setCustomPaymentOpen(false)
  }

  function updateLine(
    id: number,
    field: Exclude<keyof ReceiptFormLine, "id">,
    value: string
  ) {
    setLines((current) =>
      current.map((line) =>
        line.id === id ? { ...line, [field]: value } : line
      )
    )
  }

  function handleCategoryChange(lineId: number, value?: string | null) {
    if (value === CREATE_CATEGORY_VALUE) {
      setCategoryLineId(lineId)
      setCategoryName("")
      setCategoryBudget("")
      setCategoryError("")
      setCategoryOpen(true)
      return
    }
    updateLine(lineId, "allocationId", value ?? "")
  }

  async function createCategory() {
    const budget = Number(categoryBudget.replace(/,/g, ""))
    if (!categoryName.trim() || !Number.isFinite(budget) || budget <= 0) {
      setCategoryError("Add a category name and a budget greater than zero.")
      return
    }

    setCategoryPending(true)
    setCategoryError("")
    const result = await createProjectTaskAction(project.id, {
      name: categoryName.trim(),
      budget,
    })
    setCategoryPending(false)
    if (!result.success) {
      setCategoryError(result.error)
      return
    }

    setCategories((current) =>
      [...current, result.data].sort((a, b) => a.name.localeCompare(b.name))
    )
    if (categoryLineId !== null) {
      updateLine(categoryLineId, "allocationId", result.data.id)
    }
    setCategoryName("")
    setCategoryBudget("")
    setCategoryLineId(null)
    setCategoryOpen(false)
  }

  function validateReceiptDetails() {
    if (!supplierId) {
      setError("Choose a supplier before continuing.")
      return false
    }
    if (!purchaseDate) {
      setError("Choose the purchase date before continuing.")
      return false
    }
    if (lines.length === 0) {
      setError("Add at least one purchased item.")
      return false
    }

    const invalidLine = lines.find((line) => {
      const itemNumber = lines.indexOf(line) + 1
      if (!line.description.trim()) {
        setError(`Enter a description for item ${itemNumber}.`)
        return true
      }
      if (!line.allocationId.trim()) {
        setError(`Choose a category for item ${itemNumber}.`)
        return true
      }
      if (
        !Number.isFinite(Number(line.quantity)) ||
        Number(line.quantity) <= 0
      ) {
        setError(`Enter a quantity greater than zero for item ${itemNumber}.`)
        return true
      }
      if (
        !Number.isFinite(Number(line.unitAmount)) ||
        Number(line.unitAmount) < 0
      ) {
        setError(`Enter a valid rate for item ${itemNumber}.`)
        return true
      }
      return false
    })
    if (invalidLine) {
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
    if (submissionLockRef.current) return
    if (!validateReceiptDetails()) return
    if (paid > total) {
      setError("Amount paid cannot exceed the receipt total.")
      return
    }
    if (paid > 0 && (!paymentDate || !paymentMethod)) {
      setError("Add the payment date and method.")
      return
    }
    submissionLockRef.current = true

    setSaving(true)
    setError("")
    try {
      let receiptFileId = uploadedReceiptFileId
      if (files[0] && !receiptFileId) {
        receiptFileId = await (uploadPromiseRef.current ??
          uploadZimbaFile(files[0], "expense_receipt"))
        setUploadedReceiptFileId(receiptFileId)
      }

      const result = await createPayableExpenseAction(slug, {
        project_id: project.id,
        supplier_id: supplierId,
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
          allocation_id: line.allocationId,
          description: line.description.trim(),
          quantity: Number(line.quantity),
          unit_amount: Number(line.unitAmount),
        })),
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      await deleteReceiptDraft(draftKey)
      router.push(projectHref)
      router.refresh()
    } catch (submissionError) {
      setError(
        submissionError instanceof ApplicationError
          ? submissionError.toPublicError()
          : new ApplicationError("NETWORK_UNAVAILABLE", undefined, {
              cause: submissionError,
            }).toPublicError()
      )
    } finally {
      setSaving(false)
      submissionLockRef.current = false
    }
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
            variant="ghost"
            onClick={async () => {
              await deleteReceiptDraft(draftKey)
              setSupplierId("")
              setPurchaseDate(today)
              setFiles([])
              uploadFileRef.current = null
              uploadAttemptRef.current += 1
              uploadPromiseRef.current = null
              setUploadedReceiptFileId(undefined)
              setLines([makeLine(1, project.tasks[0]?.id)])
              setAmountPaid("")
              setPaymentReference("")
            }}
          >
            Discard draft
          </Button>
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

      {error && <ErrorNotice error={error} />}

      <div className="grid items-start gap-5 pb-20 md:pb-0 lg:grid-cols-[minmax(0,3fr)_minmax(22rem,2fr)]">
        <div
          className={`${mobileStep === "preview" ? "hidden md:grid" : "grid"} gap-5`}
        >
          <section className="grid gap-4">
            <h3 className="font-medium text-base">Receipt details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
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
                    href={`/${slug}/suppliers/new`}
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
                  onFiles={selectReceiptFiles}
                  onRemove={() => {
                    setFiles([])
                    setUploadedReceiptFileId(undefined)
                  }}
                />
                {uploadStatus !== "idle" && (
                  <div
                    className="mt-2 flex min-h-9 items-center justify-between rounded-lg border bg-muted/20 px-3 text-xs"
                    aria-live="polite"
                  >
                    <span>
                      {uploadStatus === "uploading" && "Uploading receipt…"}
                      {uploadStatus === "uploaded" && "Receipt upload complete"}
                      {uploadStatus === "error" &&
                        "Receipt upload failed. Your form is still saved."}
                    </span>
                    {uploadStatus === "error" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={retryUpload}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          <ReceiptLineItems
            lines={lines}
            categories={categories}
            total={total}
            paidInFull={paidInFull}
            createCategoryValue={CREATE_CATEGORY_VALUE}
            onAdd={() =>
              setLines((current) => [
                ...current,
                makeLine(
                  Math.max(...current.map((line) => line.id)) + 1,
                  categories[0]?.id
                ),
              ])
            }
            onRemove={(lineId) =>
              setLines((current) =>
                current.filter((line) => line.id !== lineId)
              )
            }
            onChange={updateLine}
            onCategoryChange={handleCategoryChange}
            onPaidInFullChange={togglePaidInFull}
          />
          <PaymentPanel
            customPaymentOpen={customPaymentOpen}
            amountPaid={amountPaid}
            paid={paid}
            paymentDate={paymentDate}
            paymentMethod={paymentMethod}
            paymentReference={paymentReference}
            paymentStatus={paymentStatus}
            paymentStatusClass={paymentStatusClass}
            onToggleCustomPayment={() => setCustomPaymentOpen((open) => !open)}
            onAmountPaidChange={(value) => {
              setPaidInFull(false)
              setAmountPaid(value)
            }}
            onPaymentDateChange={setPaymentDate}
            onPaymentMethodChange={setPaymentMethod}
            onPaymentReferenceChange={setPaymentReference}
          />
        </div>

        <ReceiptPreview
          project={project}
          supplier={selectedSupplier}
          organizationName={workspace.organizationName}
          purchaseDate={purchaseDate}
          lines={lines}
          total={total}
          paid={paid}
          outstanding={outstanding}
          paymentStatus={paymentStatus}
          paymentStatusClass={paymentStatusClass}
          hiddenOnMobile={mobileStep === "entry"}
        />
      </div>

      <CreateCategoryDialog
        open={categoryOpen}
        name={categoryName}
        budget={categoryBudget}
        error={categoryError}
        pending={categoryPending}
        onOpenChange={setCategoryOpen}
        onNameChange={setCategoryName}
        onBudgetChange={setCategoryBudget}
        onSubmit={createCategory}
      />

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
