import "server-only"
import {
  createSupplierCategoryUseCase,
  createSupplierUseCase,
  listSupplierCategoriesUseCase,
  listSupplierSummariesUseCase,
  updateSupplierUseCase,
} from "@workspace/api"
import { apiExecutor, apiTransaction } from "@workspace/api-runtime"
import type { WorkspaceRole } from "@workspace/contracts"
import type { SupplierCreate, SupplierResponse } from "@/lib/types"
import { normalizeRole } from "../auth/permissions"
import { requireSession } from "../auth/service"

export async function getSuppliersList(): Promise<SupplierResponse[]> {
  const { user, organization } = await requireSession()
  const suppliers = await listSupplierSummariesUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: normalizeRole(organization.role) as WorkspaceRole,
    },
    apiExecutor
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
  const { user, organization } = await requireSession()
  return createSupplierUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: normalizeRole(organization.role) as WorkspaceRole,
    },
    apiExecutor,
    {
      organizationId: organization.organizationId,
      ...data,
    }
  )
}

export async function updateSupplier(
  supplierId: string,
  data: SupplierCreate & { status?: string | null }
) {
  const { user, organization } = await requireSession()
  return updateSupplierUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: normalizeRole(organization.role) as WorkspaceRole,
    },
    apiTransaction,
    supplierId,
    data
  )
}

export async function getSupplierCategories() {
  const { user, organization } = await requireSession()
  return listSupplierCategoriesUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: normalizeRole(organization.role) as WorkspaceRole,
    },
    apiExecutor
  )
}

export async function createSupplierCategory(name: string) {
  const { user, organization } = await requireSession()
  return createSupplierCategoryUseCase(
    {
      userId: user.id,
      organizationId: organization.organizationId,
      role: normalizeRole(organization.role) as WorkspaceRole,
    },
    apiExecutor,
    name
  )
}
