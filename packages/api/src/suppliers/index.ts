import type { SupplierDto } from "@workspace/contracts"
import { supplierInputSchema } from "@workspace/contracts"
import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  createSupplier,
  createSupplierCategory,
  findSupplierCategoryBySlug,
  findSupplierForOrganization,
  listSuppliersForOrganization,
  updateSupplierForOrganization,
} from "@workspace/db/repositories"
import {
  conflictError,
  notFoundError,
  validationError,
} from "../shared/application-error"
import { requireRole } from "../shared/authorization"
import type { WorkspaceContext } from "../shared/workspace-context"

export async function createSupplierUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  rawInput: unknown
): Promise<SupplierDto> {
  const input = supplierInputSchema.parse(rawInput)
  if (input.organizationId !== ctx.organizationId)
    validationError("Organization mismatch.")
  const created = await createSupplier(deps.executor, {
    organizationId: ctx.organizationId,
    name: input.name,
    category: input.category,
    companyContact: input.companyContact,
    contactName: input.contactName,
    phone: input.phone,
    email: input.email || null,
    notes: input.notes,
    status: input.status,
  })
  if (!created) throw new Error("Supplier insert failed")
  return {
    id: created.id,
    organizationId: created.organizationId,
    name: created.name,
    category: created.category,
    email: created.email,
    status: created.status,
  }
}

export async function getSupplierUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  supplierId: string
): Promise<SupplierDto> {
  const [supplier] = await findSupplierForOrganization(
    deps.executor,
    ctx.organizationId,
    supplierId
  )
  if (!supplier) notFoundError("Supplier not found.")
  return {
    id: supplier.id,
    organizationId: supplier.organizationId,
    name: supplier.name,
    category: supplier.category,
    email: supplier.email,
    status: supplier.status,
  }
}

export async function listSuppliersUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor }
): Promise<SupplierDto[]> {
  const rows = await listSuppliersForOrganization(
    deps.executor,
    ctx.organizationId
  )
  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    category: row.category,
    email: row.email,
    status: row.status,
  }))
}

export async function updateSupplierUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  supplierId: string,
  rawInput: unknown
): Promise<SupplierDto> {
  requireRole(ctx.role, ["owner", "site_manager", "accountant"])
  const input = supplierInputSchema
    .omit({ organizationId: true })
    .safeParse(rawInput)
  if (!input.success) validationError("Enter valid supplier details.")
  const updated = await updateSupplierForOrganization(
    deps.executor,
    ctx.organizationId,
    supplierId,
    {
      name: input.data.name,
      category: input.data.category,
      companyContact: input.data.companyContact,
      contactName: input.data.contactName,
      phone: input.data.phone,
      email: input.data.email || null,
      notes: input.data.notes,
      status: input.data.status,
    }
  )
  if (!updated) notFoundError("Supplier not found.")
  return {
    id: updated.id,
    organizationId: updated.organizationId,
    name: updated.name,
    category: updated.category,
    email: updated.email,
    status: updated.status,
  }
}

export async function createSupplierCategoryUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  rawName: unknown
) {
  requireRole(ctx.role, ["owner", "site_manager", "accountant"])
  if (typeof rawName !== "string") validationError("Enter a category name.")
  const name = rawName.trim().replace(/\s+/g, " ")
  if (!name) validationError("Enter a category name.")
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  if (!slug)
    validationError("Enter a category name containing letters or numbers.")
  if (["materials", "labour", "equipment", "services"].includes(slug))
    conflictError("That category already exists in this organization.")
  const [existing] = await findSupplierCategoryBySlug(
    deps.executor,
    ctx.organizationId,
    slug
  )
  if (existing)
    conflictError("That category already exists in this organization.")
  const category = await createSupplierCategory(deps.executor, {
    organizationId: ctx.organizationId,
    name,
    slug,
  })
  if (!category) throw new Error("Supplier category insert failed")
  return category
}
