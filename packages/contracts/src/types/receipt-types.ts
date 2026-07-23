import type { z } from "zod"
import type { receiptCreateInputSchema } from "../zod"

export type ReceiptLineDto = {
  id: string
  allocationId: string
  itemDescription: string
  quantity: number
  amountCents: number
}
export type ReceiptDto = {
  id: string
  organizationId: string
  projectId: string | null
  supplierId: string | null
  paymentStatus: string
  lines?: ReceiptLineDto[]
}
export type ReceiptCreateOutputDto = {
  id: string
  paymentStatus: string
  totalCents: number
  paidCents: number
}
export type ReceiptPaymentDto = {
  id: string
  amountCents: number
  currency: string
  method: string | null
  paymentDate: Date | null
}
export type ReceiptCreateInput = z.infer<typeof receiptCreateInputSchema>
