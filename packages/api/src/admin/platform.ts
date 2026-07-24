import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  listPlatformPayments as readPlatformPayments,
  listPlatformProjects as readPlatformProjects,
  listPlatformReceipts as readPlatformReceipts,
  readPlatformStats,
  listPlatformSuppliers as readPlatformSuppliers,
} from "@workspace/db/repositories"

export async function getPlatformStatsUseCase(deps: {
  executor: DatabaseExecutor
}) {
  const stats = await readPlatformStats(deps.executor)

  return {
    ...stats,
    organizationsNeedingAttention:
      stats.suspendedOrganizations + stats.trialOrganizations,
  }
}

export function listPlatformSuppliersUseCase(deps: {
  executor: DatabaseExecutor
}) {
  return readPlatformSuppliers(deps.executor)
}

export async function listPlatformReceiptsUseCase(deps: {
  executor: DatabaseExecutor
}) {
  const rows = await readPlatformReceipts(deps.executor)

  return rows.map((row) => ({
    ...row,
    projectName: row.projectName ?? "None",
    supplierName: row.supplierName ?? "None",
  }))
}

export async function listPlatformPaymentsUseCase(deps: {
  executor: DatabaseExecutor
}) {
  const rows = await readPlatformPayments(deps.executor)

  return rows.map((row) => ({
    ...row,
    supplierName: row.supplierName ?? "None",
  }))
}

export function listPlatformProjectsUseCase(deps: {
  executor: DatabaseExecutor
}) {
  return readPlatformProjects(deps.executor)
}
