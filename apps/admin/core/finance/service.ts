import "server-only"
import {
  listPlatformPaymentsUseCase,
  listPlatformReceiptsUseCase,
  listPlatformSuppliersUseCase,
} from "@workspace/api"
import { db } from "@workspace/db"

export async function listPlatformSuppliers() {
  return listPlatformSuppliersUseCase({ executor: db })
}

export async function listPlatformReceipts() {
  return listPlatformReceiptsUseCase({ executor: db })
}

export async function listPlatformPayments() {
  return listPlatformPaymentsUseCase({ executor: db })
}
