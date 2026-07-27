import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  appendAuditEvent: vi.fn(),
  deletePayableForOrganization: vi.fn(),
  deleteReceiptForOrganization: vi.fn(),
}))
vi.mock("@workspace/db/audit", () => repo)
vi.mock("@workspace/db/receipts", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import { deleteReceiptUseCase } from "./delete-receipt"

const context = {
  userId: "user-1",
  organizationId: "org-1",
  role: "accountant" as const,
}
const run = async (callback: (tx: never) => Promise<unknown>) =>
  callback({} as never)

describe("deleteReceiptUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.deleteReceiptForOrganization.mockResolvedValue([{ id: "receipt-1" }])
    repo.deletePayableForOrganization.mockResolvedValue(undefined)
  })

  it("deletes a tenant-scoped receipt and writes audit in the transaction", async () => {
    const result = await deleteReceiptUseCase(context, "receipt-1")

    expect(result).toEqual({ id: "receipt-1" })
    expect(repo.deleteReceiptForOrganization).toHaveBeenCalledWith(
      {},
      "org-1",
      "receipt-1"
    )
    expect(repo.appendAuditEvent).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        organizationId: "org-1",
        actorId: "user-1",
        action: "receipt.delete",
        entityId: "receipt-1",
      })
    )
  })

  it("rejects unsupported roles before deleting", async () => {
    await expect(
      deleteReceiptUseCase({ ...context, role: "viewer" }, "receipt-1")
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(repo.deleteReceiptForOrganization).not.toHaveBeenCalled()
  })

  it("returns not found without leaking another workspace", async () => {
    repo.deleteReceiptForOrganization.mockResolvedValue([])
    repo.deletePayableForOrganization.mockResolvedValue(undefined)

    await expect(
      deleteReceiptUseCase(context, "missing")
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
    expect(repo.appendAuditEvent).not.toHaveBeenCalled()
  })
})
