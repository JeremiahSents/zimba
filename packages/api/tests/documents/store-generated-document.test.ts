import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  appendAuditEvent: vi.fn(),
  attachPaymentDocument: vi.fn(),
  attachReceiptDocument: vi.fn(),
  createUploadedFile: vi.fn(),
}))
vi.mock("@workspace/db/audit", () => repo)
vi.mock("@workspace/db/files", () => repo)
vi.mock("@workspace/db/receipts", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))
vi.mock("@workspace/db", () => ({ db: dbMock }))

import { storeGeneratedDocumentUseCase } from "../../src/documents/store-generated-document"

const context = {
  userId: "user-1",
  organizationId: "org-1",
  role: "accountant" as const,
}

const input = {
  target: { kind: "receipt" as const, id: "expense-1" },
  key: "abc123",
  url: "https://files.test/abc123.pdf",
  filename: "Receipt-ORG-004821.pdf",
  contentType: "application/pdf",
  sizeBytes: 5083,
}

describe("storeGeneratedDocumentUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    dbMock.transaction.mockImplementation(
      async <Result>(
        callback: (tx: unknown) => Promise<Result>
      ): Promise<Result> => callback({})
    )
    repo.createUploadedFile.mockResolvedValue({
      id: "file-1",
      key: input.key,
      url: input.url,
      filename: input.filename,
    })
    repo.attachReceiptDocument.mockResolvedValue({ id: "expense-1" })
    repo.attachPaymentDocument.mockResolvedValue({ id: "payment-1" })
  })

  it("writes the file and the link in one transaction", async () => {
    const result = await storeGeneratedDocumentUseCase(context, input)

    expect(dbMock.transaction).toHaveBeenCalledOnce()
    expect(repo.createUploadedFile).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        organizationId: "org-1",
        uploaderId: "user-1",
        purpose: "receipt_document",
        status: "completed",
      })
    )
    expect(repo.attachReceiptDocument).toHaveBeenCalledWith(
      {},
      "org-1",
      "expense-1",
      "file-1"
    )
    expect(result).toEqual({
      fileId: "file-1",
      url: input.url,
      filename: input.filename,
    })
  })

  it("uses the payment purpose and attach for a payment target", async () => {
    await storeGeneratedDocumentUseCase(context, {
      ...input,
      target: { kind: "payment", id: "payment-1" },
    })

    expect(repo.createUploadedFile).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ purpose: "payment_voucher" })
    )
    expect(repo.attachPaymentDocument).toHaveBeenCalledWith(
      {},
      "org-1",
      "payment-1",
      "file-1"
    )
    expect(repo.attachReceiptDocument).not.toHaveBeenCalled()
  })

  it("records an audit event naming the entity", async () => {
    await storeGeneratedDocumentUseCase(context, input)

    expect(repo.appendAuditEvent).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        organizationId: "org-1",
        actorId: "user-1",
        action: "receipt.document_generated",
        entityType: "expense",
        entityId: "expense-1",
        changes: { fileId: "file-1", key: input.key },
      })
    )
  })

  it("rejects a viewer", async () => {
    await expect(
      storeGeneratedDocumentUseCase({ ...context, role: "viewer" }, input)
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(repo.createUploadedFile).not.toHaveBeenCalled()
  })

  it("fails when the target belongs to another workspace", async () => {
    // The attach is org-scoped, so a miss is the tenancy check firing.
    repo.attachReceiptDocument.mockResolvedValue(undefined)

    await expect(
      storeGeneratedDocumentUseCase(context, input)
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
  })

  it("rejects a malformed url before touching the database", async () => {
    await expect(
      storeGeneratedDocumentUseCase(context, { ...input, url: "not-a-url" })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(repo.createUploadedFile).not.toHaveBeenCalled()
  })
})
