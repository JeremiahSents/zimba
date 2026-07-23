"use client"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { formatCurrency } from "@/lib/format"
import type { TaskResponse } from "@/lib/types"

export type ReceiptFormLine = {
  id: number
  allocationId: string
  description: string
  quantity: string
  unitAmount: string
}

type ReceiptLineItemsProps = {
  lines: ReceiptFormLine[]
  categories: TaskResponse[]
  total: number
  paidInFull: boolean
  createCategoryValue: string
  onAdd: () => void
  onRemove: (lineId: number) => void
  onChange: (
    lineId: number,
    field: Exclude<keyof ReceiptFormLine, "id">,
    value: string
  ) => void
  onCategoryChange: (lineId: number, value?: string | null) => void
  onPaidInFullChange: (checked: boolean) => void
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "")
}

function formatNumericInput(value: string) {
  const digits = digitsOnly(value)
  return digits ? Number(digits).toLocaleString("en-US") : ""
}

export function ReceiptLineItems({
  lines,
  categories,
  total,
  paidInFull,
  createCategoryValue,
  onAdd,
  onRemove,
  onChange,
  onCategoryChange,
  onPaidInFullChange,
}: ReceiptLineItemsProps) {
  return (
    <section className="overflow-hidden border-t pt-5">
      <h3 className="mb-4 font-medium text-base">Items purchased</h3>
      <div className="overflow-hidden rounded-xl border">
        <div className="hidden grid-cols-[minmax(10rem,1.4fr)_minmax(9rem,1fr)_5rem_8rem_8rem_3rem] bg-muted/35 font-semibold text-[10px] text-muted-foreground uppercase tracking-wide md:grid">
          <div className="px-3 py-2.5">Item</div>
          <div className="border-l px-3 py-2.5">Category</div>
          <div className="border-l px-2 py-2.5 text-right">Qty</div>
          <div className="border-l px-2 py-2.5 text-right">Rate</div>
          <div className="border-l px-2 py-2.5 text-right">Amount</div>
          <div className="border-l" />
        </div>

        <div className="grid gap-3 p-3 md:gap-0 md:p-0">
          {lines.map((line, index) => {
            const amount =
              Number(line.quantity || 0) * Number(line.unitAmount || 0)
            return (
              <div
                key={line.id}
                className="grid gap-3 rounded-xl border bg-background p-3 md:grid-cols-[minmax(10rem,1.4fr)_minmax(9rem,1fr)_5rem_8rem_8rem_3rem] md:gap-0 md:rounded-none md:border-x-0 md:border-b-0 md:p-0 md:first:border-t-0"
              >
                <label className="grid gap-1.5">
                  <Label className="md:sr-only" htmlFor={`item-${line.id}`}>
                    Item {index + 1}
                  </Label>
                  <Input
                    id={`item-${line.id}`}
                    value={line.description}
                    onChange={(event) =>
                      onChange(line.id, "description", event.target.value)
                    }
                    placeholder={`Item ${index + 1}`}
                    className="md:rounded-none md:border-0 md:bg-transparent"
                  />
                </label>

                <label className="grid gap-1.5">
                  <Label className="md:sr-only">Category</Label>
                  <Select
                    value={line.allocationId}
                    onValueChange={(value) => onCategoryChange(line.id, value)}
                  >
                    <SelectTrigger className="h-11 w-full px-3 text-sm md:rounded-none md:border-y-0 md:border-r-0 md:bg-transparent">
                      <SelectValue placeholder="Choose category">
                        {
                          categories.find(
                            (category) =>
                              String(category.id) === line.allocationId
                          )?.name
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                      <SelectItem
                        value={createCategoryValue}
                        className="font-medium text-primary"
                      >
                        + Create new category
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </label>

                <label className="grid gap-1.5">
                  <Label className="md:sr-only" htmlFor={`quantity-${line.id}`}>
                    Quantity
                  </Label>
                  <Input
                    id={`quantity-${line.id}`}
                    inputMode="numeric"
                    value={line.quantity}
                    onChange={(event) =>
                      onChange(
                        line.id,
                        "quantity",
                        digitsOnly(event.target.value)
                      )
                    }
                    className="text-right md:rounded-none md:border-y-0 md:border-r-0 md:bg-transparent"
                  />
                </label>

                <label className="grid gap-1.5">
                  <Label className="md:sr-only" htmlFor={`rate-${line.id}`}>
                    Rate
                  </Label>
                  <Input
                    id={`rate-${line.id}`}
                    inputMode="numeric"
                    value={formatNumericInput(line.unitAmount)}
                    onChange={(event) =>
                      onChange(
                        line.id,
                        "unitAmount",
                        digitsOnly(event.target.value)
                      )
                    }
                    placeholder="0"
                    className="text-right md:rounded-none md:border-y-0 md:border-r-0 md:bg-transparent"
                  />
                </label>

                <div className="flex min-h-11 items-center justify-between rounded-lg bg-muted/25 px-3 text-sm md:justify-end md:rounded-none md:border-l">
                  <span className="text-muted-foreground md:hidden">
                    Amount
                  </span>
                  <strong>{formatCurrency(amount)}</strong>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={lines.length === 1}
                  onClick={() => onRemove(line.id)}
                  aria-label={`Remove item ${index + 1}`}
                  className="justify-self-end md:self-center md:justify-self-center"
                >
                  Remove
                </Button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between border-t p-3">
          <Button type="button" size="sm" variant="secondary" onClick={onAdd}>
            + Add item
          </Button>
          <strong className="font-heading text-lg">
            {formatCurrency(total)}
          </strong>
        </div>
        <label className="mx-3 mb-3 flex cursor-pointer items-center gap-2 rounded-lg bg-muted/35 px-3 py-2.5 text-sm">
          <input
            type="checkbox"
            checked={paidInFull}
            onChange={(event) => onPaidInFullChange(event.target.checked)}
            className="size-4 accent-primary"
          />
          <span className="font-medium">Bill paid in full</span>
        </label>
      </div>
    </section>
  )
}
