import type {
  DatabaseTransaction,
  TransactionRunner,
} from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  appendAuditEvent: vi.fn(),
  createInvitationRecord: vi.fn(),
  deleteInvitation: vi.fn(),
  findPendingInvitation: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import { createInvitationUseCase } from "./create-invitation"

const context = {
  userId: "user-1",
  organizationId: "org-1",
  role: "site_manager" as const,
}

const transactionMock = vi.fn(
  async <Result>(
    callback: (tx: DatabaseTransaction) => Promise<Result>
  ): Promise<Result> => callback({} as DatabaseTransaction)
)
const deps = { transaction: transactionMock as TransactionRunner }

describe("createInvitationUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    transactionMock.mockImplementation(
      async <Result>(
        callback: (tx: DatabaseTransaction) => Promise<Result>
      ): Promise<Result> => callback({} as DatabaseTransaction)
    )
    repo.findPendingInvitation.mockResolvedValue([])
    repo.createInvitationRecord.mockResolvedValue({ id: "invitation-1" })
  })

  it("creates an invitation and audits it in the transaction", async () => {
    const result = await createInvitationUseCase(context, deps, {
      email: " Person@Example.COM ",
      role: "accountant",
    })

    expect(result).toMatchObject({
      invitationId: "invitation-1",
      email: "person@example.com",
      role: "accountant",
    })
    expect(result.token).toEqual(expect.any(String))
    expect(repo.createInvitationRecord).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        organizationId: "org-1",
        invitedBy: "user-1",
        email: "person@example.com",
        role: "accountant",
      })
    )
    expect(repo.appendAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        organizationId: "org-1",
        actorId: "user-1",
        action: "team.invite",
      })
    )
  })

  it("deletes an existing pending invitation before recreating it", async () => {
    repo.findPendingInvitation.mockResolvedValue([{ id: "old-invite" }])

    await createInvitationUseCase(context, deps, {
      email: "person@example.com",
      role: "viewer",
    })

    expect(repo.deleteInvitation).toHaveBeenCalledWith(
      expect.anything(),
      "old-invite"
    )
  })

  it("rejects invalid email input", async () => {
    await expect(
      createInvitationUseCase(context, deps, {
        email: "not-an-email",
        role: "viewer",
      })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(transactionMock).not.toHaveBeenCalled()
  })

  it("rejects unsupported actors", async () => {
    await expect(
      createInvitationUseCase({ ...context, role: "accountant" }, deps, {
        email: "person@example.com",
        role: "viewer",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(transactionMock).not.toHaveBeenCalled()
  })

  it("prevents site managers from inviting owners", async () => {
    await expect(
      createInvitationUseCase(context, deps, {
        email: "owner@example.com",
        role: "owner",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(transactionMock).not.toHaveBeenCalled()
  })

  it("allows owners to invite owners", async () => {
    const result = await createInvitationUseCase(
      { ...context, role: "owner" },
      deps,
      { email: "owner@example.com", role: "owner" }
    )

    expect(result.role).toBe("owner")
  })
})
