import type {
  DatabaseTransaction,
  TransactionRunner,
} from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  appendAuditEvent: vi.fn(),
  createProjectAttachment: vi.fn(),
  deleteProjectForOrganization: vi.fn(),
  findActiveProjectForOrganization: vi.fn(),
  findFileForOrganization: vi.fn(),
  updateProjectForOrganization: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import {
  archiveProjectUseCase,
  deleteProjectUseCase,
  restoreProjectUseCase,
  updateProjectUseCase,
} from "./manage-project"

const ctx = {
  userId: "user-1",
  organizationId: "org-1",
  role: "owner" as const,
}

const project = {
  id: "project-1",
  organizationId: "org-1",
  name: "Villa",
  location: "Kampala",
  status: "active",
  currency: "UGX",
}

const completedAttachment = {
  id: "file-1",
  organizationId: "org-1",
  status: "completed",
  purpose: "project_attachment",
}

const transactionMock = vi.fn(
  async <Result>(
    callback: (tx: DatabaseTransaction) => Promise<Result>
  ): Promise<Result> => callback({} as DatabaseTransaction)
)
const deps = { transaction: transactionMock as TransactionRunner }

describe("project mutation use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    transactionMock.mockImplementation(
      async <Result>(
        callback: (tx: DatabaseTransaction) => Promise<Result>
      ): Promise<Result> => callback({} as DatabaseTransaction)
    )
    repo.findActiveProjectForOrganization.mockResolvedValue([project])
    repo.updateProjectForOrganization.mockResolvedValue(project)
    repo.findFileForOrganization.mockResolvedValue([completedAttachment])
    repo.createProjectAttachment.mockResolvedValue({ id: "attachment-1" })
    repo.deleteProjectForOrganization.mockResolvedValue(project)
  })

  it("updates a project, validates attachments, and writes an audit event", async () => {
    const result = await updateProjectUseCase(ctx, deps, "project-1", {
      name: "Updated Villa",
      attachmentIds: ["file-1"],
    })

    expect(result).toBe(project)
    expect(repo.updateProjectForOrganization).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "project-1",
      expect.objectContaining({ name: "Updated Villa" })
    )
    expect(repo.findFileForOrganization).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "file-1"
    )
    expect(repo.createProjectAttachment).toHaveBeenCalledWith(
      expect.anything(),
      {
        organizationId: "org-1",
        projectId: "project-1",
        fileId: "file-1",
      }
    )
    expect(repo.appendAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        organizationId: "org-1",
        actorId: "user-1",
        action: "project.update",
        entityId: "project-1",
      })
    )
  })

  it("rejects invalid project input", async () => {
    await expect(
      updateProjectUseCase(ctx, deps, "project-1", { name: "" })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(transactionMock).not.toHaveBeenCalled()
  })

  it("rejects an unknown or cross-workspace project", async () => {
    repo.findActiveProjectForOrganization.mockResolvedValue([])
    await expect(
      updateProjectUseCase(ctx, deps, "project-2", { name: "Name" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
  })

  it("rejects an attachment from another workspace", async () => {
    repo.findFileForOrganization.mockResolvedValue([])
    await expect(
      updateProjectUseCase(ctx, deps, "project-1", {
        attachmentIds: ["foreign-file"],
      })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(repo.appendAuditEvent).not.toHaveBeenCalled()
  })

  it("archives and restores projects as owner-only mutations", async () => {
    await archiveProjectUseCase(ctx, deps, "project-1")
    expect(repo.updateProjectForOrganization).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "project-1",
      expect.objectContaining({ status: "archived", archivedBy: "user-1" })
    )

    await restoreProjectUseCase(ctx, deps, "project-1")
    expect(repo.updateProjectForOrganization).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "project-1",
      expect.objectContaining({ status: "active", archivedBy: null })
    )
  })

  it("rejects delete for unsupported workspace roles", async () => {
    await expect(
      deleteProjectUseCase({ ...ctx, role: "site_manager" }, deps, "project-1")
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(repo.deleteProjectForOrganization).not.toHaveBeenCalled()
  })

  it("deletes a project and audits the deletion", async () => {
    const result = await deleteProjectUseCase(ctx, deps, "project-1")

    expect(result).toBe(project)
    expect(repo.deleteProjectForOrganization).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "project-1"
    )
    expect(repo.appendAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: "project.delete",
        changes: { name: project.name },
      })
    )
  })

  it("rejects unknown project deletion", async () => {
    repo.deleteProjectForOrganization.mockResolvedValue(undefined)
    await expect(
      deleteProjectUseCase(ctx, deps, "missing-project")
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
  })

  it("keeps multi-write update workflows inside one transaction", async () => {
    repo.createProjectAttachment.mockRejectedValue(new Error("insert failed"))

    await expect(
      updateProjectUseCase(ctx, deps, "project-1", {
        name: "Updated",
        attachmentIds: ["file-1"],
      })
    ).rejects.toThrow("insert failed")

    expect(transactionMock).toHaveBeenCalledTimes(1)
    expect(repo.appendAuditEvent).not.toHaveBeenCalled()
  })
})
