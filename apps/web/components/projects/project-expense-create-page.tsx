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
import { useMemo, useState } from "react"
import { createExpenseReceiptAction } from "@/app/admin/actions"
import { UploadZone } from "@/components/projects/upload-zone"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { DatePicker } from "@/components/shared/date-picker"
import { toApiExpenseStatus } from "@/lib/api/normalizers"
import { formatCurrency } from "@/lib/format"
import type { ProjectDetailResponse } from "@/lib/types"
import { uploadZimbaFile } from "@/lib/upload-file"

type ReceiptItem = {
  id: number
  itemDetails: string
  taskName: string
  supplierName: string
  quantity: string
  rate: string
}

export function ProjectExpenseCreatePage({
  project,
}: {
  project: ProjectDetailResponse
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState<"Partial" | "Full" | "Not paid">("Full")
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const supplierOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...project.suppliers.map((supplier) => supplier.name),
          ...project.expenses.map((expense) => expense.supplier_name),
        ])
      ).filter(Boolean),
    [project.expenses, project.suppliers]
  )
  const [items, setItems] = useState<ReceiptItem[]>(() => [
    {
      id: 1,
      itemDetails: "",
      taskName: project.tasks[0]?.name ?? "",
      supplierName: supplierOptions[0] ?? "",
      quantity: "1",
      rate: "",
    },
  ])

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
      dataSource="mock"
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
              onFiles={(incoming) => setFiles(incoming.slice(0, 1))}
              onRemove={() => setFiles([])}
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
          <CardContent className="overflow-x-auto p-0">
            <div className="min-w-[880px]">
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
                        onValueChange={(value) =>
                          updateItem(item.id, "taskName", value ?? "")
                        }
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
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border-l">
                      <Select
                        value={item.supplierName}
                        onValueChange={(value) =>
                          updateItem(item.id, "supplierName", value ?? "")
                        }
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

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
    </DashboardShell>
  )
}
