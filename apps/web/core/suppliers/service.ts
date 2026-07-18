import "server-only"
import { requireSession } from "../auth/service"
import * as supplierRepo from "./repository"
import type { SupplierCreate, SupplierResponse } from "@/lib/types"

export async function getSuppliersList(): Promise<SupplierResponse[]> {
  const { organization } = await requireSession()
  const suppliers = await supplierRepo.listSuppliers(organization.organizationId)
  
  return Promise.all(suppliers.map(async s => {
    const financials = await supplierRepo.getSupplierFinancials(organization.organizationId, s.id)
    const { receiptCount = 0, incurredCents = 0, paidCents = 0 } = financials ?? {}
    return {
    id: s.id,
    supplier_id: s.id,
    name: s.name,
    category: (s.category || "other") as SupplierResponse["category"],
    phone: s.phone,
    email: s.email,
    notes: s.notes,
    companyContact: s.companyContact ?? undefined,
    contactName: s.contactName ?? undefined,
    status: s.status,
    payments: receiptCount,
    amount: incurredCents / 100,
    outstanding_amount: Math.max(0, incurredCents - paidCents) / 100,
    total_incurred: incurredCents / 100,
    total_paid: paidCents / 100,
  }}))
}

export async function createSupplier(data: SupplierCreate) {
  const { organization } = await requireSession()
  
  const supplier = await supplierRepo.createSupplier({
    organizationId: organization.organizationId,
    name: data.name,
    category: data.category,
    phone: data.phone,
    email: data.email,
    notes: data.notes,
  })

  return supplier
}
