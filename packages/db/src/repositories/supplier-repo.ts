import { and, eq } from "drizzle-orm"
import { supplier } from "../schemas/supplier-schema"
import type { DatabaseExecutor } from "./types"

export function listSuppliersForOrganization(executor: DatabaseExecutor, organizationId: string) {
  return executor.select().from(supplier).where(eq(supplier.organizationId, organizationId))
}

export function findSupplierForOrganization(executor: DatabaseExecutor, organizationId: string, supplierId: string) {
  return executor.select().from(supplier).where(and(eq(supplier.organizationId, organizationId), eq(supplier.id, supplierId))).limit(1)
}
