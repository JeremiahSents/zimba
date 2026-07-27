import { db } from "@workspace/db"

import {
  listPlatformPayments as readPlatformPayments,
  listPlatformProjects as readPlatformProjects,
  listPlatformReceipts as readPlatformReceipts,
  readPlatformStats,
  listPlatformSuppliers as readPlatformSuppliers,
} from "@workspace/db/repositories"

export async function getPlatformStatsUseCase() {
  const stats = await readPlatformStats(db)

  return {
    ...stats,
    organizationsNeedingAttention:
      stats.suspendedOrganizations + stats.trialOrganizations,
  }
}

export function listPlatformSuppliersUseCase() {
  return readPlatformSuppliers(db)
}

export async function listPlatformReceiptsUseCase() {
  const rows = await readPlatformReceipts(db)

  return rows.map((row) => ({
    ...row,
    projectName: row.projectName ?? "None",
    supplierName: row.supplierName ?? "None",
  }))
}

export async function listPlatformPaymentsUseCase() {
  const rows = await readPlatformPayments(db)

  return rows.map((row) => ({
    ...row,
    supplierName: row.supplierName ?? "None",
  }))
}

export function listPlatformProjectsUseCase() {
  return readPlatformProjects(db)
}
