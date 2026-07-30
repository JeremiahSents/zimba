import { db } from "@workspace/db"
import { findProjectForOrganization } from "@workspace/db/projects"
import {
  listPaymentsForProjectAdmin,
  listPaymentsForSupplierAdmin,
  listProjectBudgetItemsWithSpend,
  listProjectsForOrganizationAdmin,
  listReceiptsForProjectAdmin,
  listSuppliersWithPaymentStatsForOrganization,
} from "@workspace/db/platform"
import { notFoundError } from "../shared/application-error"
import type {
  AdminProjectDetailDto,
  AdminProjectPaymentDto,
  AdminProjectReceiptDto,
  AdminProjectSummaryDto,
  AdminSupplierPaymentDto,
  AdminSupplierWithStatsDto,
} from "./types"

export type {
  AdminBudgetItemDto,
  AdminProjectDetailDto,
  AdminProjectPaymentDto,
  AdminProjectReceiptDto,
  AdminProjectSummaryDto,
  AdminSupplierPaymentDto,
  AdminSupplierWithStatsDto,
} from "./types"

export async function getAdminOrgProjectsUseCase(
  organizationId: string
): Promise<AdminProjectSummaryDto[]> {
  return listProjectsForOrganizationAdmin(db, organizationId)
}

export async function getAdminProjectDetailUseCase(
  organizationId: string,
  projectId: string
): Promise<AdminProjectDetailDto> {
  const [project] = await findProjectForOrganization(db, organizationId, projectId)
  if (!project) notFoundError("Project not found in this organization.")

  const [budgetItems, receipts, payments] = await Promise.all([
    listProjectBudgetItemsWithSpend(db, organizationId, projectId),
    listReceiptsForProjectAdmin(db, organizationId, projectId),
    listPaymentsForProjectAdmin(db, organizationId, projectId),
  ])

  return {
    id: project.id,
    name: project.name,
    location: project.location,
    buildingType: project.buildingType,
    clientName: project.clientName,
    status: project.status,
    currency: project.currency,
    startDate: project.startDate,
    targetEndDate: project.targetEndDate,
    createdAt: project.createdAt,
    budgetItems,
    receipts,
    payments,
  }
}

export async function getAdminOrgSuppliersUseCase(
  organizationId: string
): Promise<AdminSupplierWithStatsDto[]> {
  return listSuppliersWithPaymentStatsForOrganization(db, organizationId)
}

export function getAdminSupplierPaymentsUseCase(
  organizationId: string,
  supplierId: string
): Promise<AdminSupplierPaymentDto[]> {
  return listPaymentsForSupplierAdmin(db, organizationId, supplierId)
}
