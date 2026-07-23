"use client"

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
import { DatePicker } from "@/components/shared/date-picker"

type Props = {
  customPaymentOpen: boolean
  amountPaid: string
  paid: number
  paymentDate: string
  paymentMethod: string
  paymentReference: string
  paymentStatus: string
  paymentStatusClass: string
  onToggleCustomPayment: () => void
  onAmountPaidChange: (value: string) => void
  onPaymentDateChange: (value: string) => void
  onPaymentMethodChange: (value: string) => void
  onPaymentReferenceChange: (value: string) => void
}

function formatNumericInput(value: string) {
  if (!value) return ""
  return Number(value).toLocaleString("en-US")
}

export function PaymentPanel({
  customPaymentOpen,
  amountPaid,
  paid,
  paymentDate,
  paymentMethod,
  paymentReference,
  paymentStatus,
  paymentStatusClass,
  onToggleCustomPayment,
  onAmountPaidChange,
  onPaymentDateChange,
  onPaymentMethodChange,
  onPaymentReferenceChange,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payment</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border bg-muted/20 px-3 py-2.5 text-left text-sm"
            onClick={onToggleCustomPayment}
            aria-expanded={customPaymentOpen}
          >
            <span className="font-medium">Custom amount paid</span>
            <span className="text-muted-foreground">
              {customPaymentOpen ? "Hide" : "Add"}
            </span>
          </button>
          {customPaymentOpen && (
            <label className="mt-3 grid gap-2">
              <Label>Amount paid</Label>
              <Input
                inputMode="numeric"
                value={formatNumericInput(amountPaid)}
                onChange={(event) =>
                  onAmountPaidChange(event.target.value.replace(/\D/g, ""))
                }
                placeholder="0"
              />
            </label>
          )}
        </div>
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
              <DatePicker value={paymentDate} onChange={onPaymentDateChange} />
            </label>
            <label className="grid gap-2">
              <Label>Payment method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  onPaymentMethodChange(value ?? "cash")
                }
              >
                <SelectTrigger className="h-11 w-full px-3 text-sm md:h-11 md:text-sm">
                  <SelectValue>
                    {(
                      {
                        cash: "Cash",
                        bank_transfer: "Bank transfer",
                        mobile_money: "Mobile money",
                        cheque: "Cheque",
                      } as Record<string, string>
                    )[paymentMethod] ?? paymentMethod}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[
                    ["cash", "Cash"],
                    ["bank_transfer", "Bank transfer"],
                    ["mobile_money", "Mobile money"],
                    ["cheque", "Cheque"],
                  ].map(([value, label]) => (
                    <SelectItem
                      key={value}
                      value={value}
                      className="min-h-11 px-3 py-2 text-sm md:min-h-10 md:px-3 md:py-2 md:text-sm"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="grid gap-2 sm:col-span-2">
              <Label>Payment reference</Label>
              <Input
                value={paymentReference}
                onChange={(event) =>
                  onPaymentReferenceChange(event.target.value)
                }
                placeholder="Optional"
              />
            </label>
          </>
        )}
      </CardContent>
    </Card>
  )
}
