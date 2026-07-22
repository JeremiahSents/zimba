export type ReceiptLineDto = { id: string; allocationId: string; itemDescription: string; quantity: number; amountCents: number }
export type ReceiptDto = { id: string; organizationId: string; projectId: string | null; supplierId: string | null; paymentStatus: string; lines?: ReceiptLineDto[] }
