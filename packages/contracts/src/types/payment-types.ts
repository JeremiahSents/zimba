export type PaymentDto = {
  id: string
  organizationId: string
  amountCents: number
  currency: string
  method: string | null
  paymentDate: Date | null
}
