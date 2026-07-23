import type { SupplierDto } from "@workspace/contracts"
import { supplierInputSchema } from "@workspace/contracts"
import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  createSupplier,
  findSupplierForOrganization,
  listSuppliersForOrganization,
} from "@workspace/db/repositories"
import { notFoundError, validationError } from "../shared/application-error"
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
