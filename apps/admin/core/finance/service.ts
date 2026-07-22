import "server-only"
import { db } from "@workspace/db"
import { listPlatformPayments as readPlatformPayments, listPlatformReceipts as readPlatformReceipts, listPlatformSuppliers as readPlatformSuppliers } from "@workspace/db/repositories"

export async function listPlatformSuppliers() {
  return readPlatformSuppliers(db)
}

export async function listPlatformReceipts() {
  const rows = await readPlatformReceipts(db)

  return rows.map((r) => ({
    ...r,
    projectName: r.projectName ?? "None",
    supplierName: r.supplierName ?? "None",
  }))
}

export async function listPlatformPayments() {
  const rows = await readPlatformPayments(db)

  return rows.map((r) => ({
    ...r,
    supplierName: r.supplierName ?? "None",
  }))
}
