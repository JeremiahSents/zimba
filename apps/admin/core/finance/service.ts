import "server-only"
import {
  listPlatformPaymentsUseCase,
  listPlatformReceiptsUseCase,
  listPlatformSuppliersUseCase,
} from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"

export async function listPlatformSuppliers() {
  return listPlatformSuppliersUseCase(apiExecutor)
}

export async function listPlatformReceipts() {
  return listPlatformReceiptsUseCase(apiExecutor)
}

export async function listPlatformPayments() {
  return listPlatformPaymentsUseCase(apiExecutor)
}
