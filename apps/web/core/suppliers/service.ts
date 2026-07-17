import "server-only"
import { requireSession } from "../auth/service"
import * as supplierRepo from "./repository"
import type { SupplierCreate, SupplierResponse } from "@/lib/types"

export async function getSuppliersList(): Promise<SupplierResponse[]> {
  const { organization } = await requireSession()
  const suppliers = await supplierRepo.listSuppliers(organization.organizationId)
  
  return suppliers.map(s => ({
    id: s.id as any,
    supplier_id: s.id as any,
    name: s.name,
    category: (s.category || "other") as SupplierResponse["category"],
    phone: s.phone,
    email: s.email,
    notes: s.notes,
    status: s.status,
    payments: 0, // Mocked for now until expenses/payments are integrated
    amount: 0,
    outstanding_amount: 0,
    total_incurred: 0,
    total_paid: 0,
  }))
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
