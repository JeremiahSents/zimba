import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  createUploadedFile: vi.fn(),
  listProjectAttachments: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(callback: (tx: unknown) => Promise<Result>): Promise<Result> =>
      callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import {
  listProjectAttachmentsUseCase,
  recordUploadedFileUseCase,
} from "./index"

const ctx = {
  userId: "user-1",
  organizationId: "org-1",
  role: "owner" as const,
}

describe("file use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.createUploadedFile.mockResolvedValue({ id: "file-1" })
    repo.listProjectAttachments.mockResolvedValue([{ file: { id: "file-1" } }])
  })

  it("records completed uploads for the current workspace and uploader", async () => {
    const result = await recordUploadedFileUseCase(ctx, {
      key: "upload-key",
      url: "https://cdn.example.com/file.pdf",
      filename: "receipt.pdf",
      contentType: "application/pdf",
      sizeBytes: 1234,
      purpose: "expense_receipt",
    })

    expect(result).toEqual({ id: "file-1" })
    expect(repo.createUploadedFile).toHaveBeenCalledWith(dbMock, {
      organizationId: "org-1",
      uploaderId: "user-1",
      key: "upload-key",
      url: "https://cdn.example.com/file.pdf",
      filename: "receipt.pdf",
      contentType: "application/pdf",
      sizeBytes: 1234,
      purpose: "expense_receipt",
      status: "completed",
    })
  })

  it("rejects malformed uploaded file input", async () => {
    await expect(
      recordUploadedFileUseCase(ctx, {
        key: "",
        url: "not-a-url",
        filename: "",
        contentType: "",
        sizeBytes: -1,
        purpose: "",
      })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(repo.createUploadedFile).not.toHaveBeenCalled()
  })

  it("lists project attachments within the current workspace", async () => {
    await expect(
      listProjectAttachmentsUseCase(ctx, "project-1")
    ).resolves.toEqual([{ file: { id: "file-1" } }])

    expect(repo.listProjectAttachments).toHaveBeenCalledWith(
      dbMock,
      "org-1",
      "project-1"
    )
  })

  it("rejects blank project ids", async () => {
    try {
      listProjectAttachmentsUseCase(ctx, " ")
      throw new Error("Expected validation to fail.")
    } catch (error) {
      expect(error).toMatchObject({ code: "VALIDATION_FAILED" })
    }
    expect(repo.listProjectAttachments).not.toHaveBeenCalled()
  })
})
