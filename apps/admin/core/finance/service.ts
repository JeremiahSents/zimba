import "server-only"
import {
  listPlatformPaymentsUseCase,
  listPlatformReceiptsUseCase,
  listPlatformSuppliersUseCase,
} from "@workspace/api"

export async function listPlatformSuppliers() {
  return listPlatformSuppliersUseCase()
}

export async function listPlatformReceipts() {
  return listPlatformReceiptsUseCase()
}

export async function listPlatformPayments() {
  return listPlatformPaymentsUseCase()
}
