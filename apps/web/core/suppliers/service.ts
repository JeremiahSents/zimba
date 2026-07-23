import "server-only"
import { requireSession } from "../auth/service"
import * as supplierRepo from "./repository"
import type { SupplierCreate, SupplierResponse } from "@/lib/types"
import { badRequest, conflict } from "../shared/errors"
import { requireRole } from "../auth/permissions"
import { recordAudit } from "../audit/service"

export async function getSuppliersList(): Promise<SupplierResponse[]> {
  const { organization } = await requireSession()
  const suppliers = await supplierRepo.listSupplierSummaries(
    organization.organizationId
  )
  return suppliers.map((s) => {
    const { receiptCount = 0, incurredCents = 0, paidCents = 0 } = s
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
    }
  })
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
    companyContact: data.companyContact,
    contactName: data.contactName,
  })

  return supplier
}

export async function updateSupplier(
  supplierId: string,
  data: SupplierCreate & { status?: string | null }
) {
  const { user, organization } = await requireSession()
  requireRole(organization.role, ["owner", "site_manager", "accountant"])
  const email = data.email?.trim() || null
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    badRequest("Enter a valid email address.")
  if (!data.name.trim()) badRequest("Add a supplier name.")
  const supplier = await supplierRepo.updateSupplier(
    organization.organizationId,
    supplierId,
    {
      name: data.name.trim(),
      category: data.category,
      phone: data.phone?.trim() || null,
      email,
      notes: data.notes?.trim() || null,
      companyContact: data.companyContact?.trim() || null,
      contactName: data.contactName?.trim() || null,
      status: data.status ?? undefined,
    }
  )
  if (!supplier) badRequest("Supplier not found.")
  await recordAudit({
    organizationId: organization.organizationId,
    actorId: user.id,
    action: "supplier.update",
    entityType: "supplier",
    entityId: supplierId,
    changes: data,
  })
  return supplier
}

export async function getSupplierCategories() {
  const { organization } = await requireSession()
  return supplierRepo.listSupplierCategories(organization.organizationId)
}

export async function createSupplierCategory(name: string) {
  const { organization } = await requireSession()
  const displayName = name.trim().replace(/\s+/g, " ")
  if (!displayName) badRequest("Enter a category name.")
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  if (!slug) badRequest("Enter a category name containing letters or numbers.")
  if (["materials", "labour", "equipment", "services"].includes(slug))
    conflict("That category already exists in this organization.")
  if (
    await supplierRepo.getSupplierCategoryBySlug(
      organization.organizationId,
      slug
    )
  )
    conflict("That category already exists in this organization.")
  const category = await supplierRepo.createSupplierCategory({
    organizationId: organization.organizationId,
    name: displayName,
    slug,
  })
  if (!category) throw new Error("Supplier category insert failed")
  return category
}
