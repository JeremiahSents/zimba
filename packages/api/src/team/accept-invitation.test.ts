import { beforeEach, describe, expect, it, vi } from "vitest"
import type {
  DatabaseTransaction,
  TransactionRunner,
} from "@workspace/db/repositories"

const repo = vi.hoisted(() => ({
  findInvitationByTokenHash: vi.fn(),
  findOrganizationById: vi.fn(),
  claimInvitationAndUpsertMember: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import { acceptInvitationUseCase } from "./accept-invitation"

const invite = {
  id: "invite-1",
  organizationId: "org-1",
  email: "person@example.com",
  role: "member",
  responsibility: null,
  status: "pending",
  expiresAt: new Date(Date.now() + 60_000),
}

const transactionMock = vi.fn(
  async <Result>(
    callback: (tx: DatabaseTransaction) => Promise<Result>
  ): Promise<Result> => callback({} as DatabaseTransaction)
)

const validDeps = {
  executor: {} as never,
  transaction: transactionMock as TransactionRunner,
}

const validCtx = { userId: "user-1", email: "person@example.com" }

describe("acceptInvitationUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.findInvitationByTokenHash.mockResolvedValue([invite])
    repo.findOrganizationById.mockResolvedValue([
      { slug: "acme", status: "active" },
    ])
    repo.claimInvitationAndUpsertMember.mockResolvedValue(true)
    transactionMock.mockImplementation(
      async <Result>(
        callback: (tx: DatabaseTransaction) => Promise<Result>
      ): Promise<Result> => callback({} as DatabaseTransaction)
    )
  })

  it("accepts a valid invitation and returns its workspace slug", async () => {
    const result = await acceptInvitationUseCase(
      { userId: "user-1", email: "PERSON@example.com" },
      validDeps,
      "a".repeat(20)
    )
    expect(result).toEqual({ workspaceSlug: "acme" })
  })

  it("accepts even if the user already belongs to another workspace", async () => {
    const result = await acceptInvitationUseCase(
      validCtx,
      validDeps,
      "a".repeat(20)
    )
    expect(result).toEqual({ workspaceSlug: "acme" })
    expect(repo.claimInvitationAndUpsertMember).toHaveBeenCalledWith(
      expect.anything(),
      invite.id,
      "user-1",
      invite.organizationId,
      invite.role,
      invite.responsibility
    )
  })

  it("rejects a malformed token with VALIDATION_FAILED", async () => {
    await expect(
      acceptInvitationUseCase(validCtx, validDeps, "short")
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(repo.findInvitationByTokenHash).not.toHaveBeenCalled()
  })

  it("rejects a non-string token with VALIDATION_FAILED", async () => {
    await expect(
      acceptInvitationUseCase(validCtx, validDeps, 12345)
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(repo.findInvitationByTokenHash).not.toHaveBeenCalled()
  })

  it("rejects an unknown token with NOT_FOUND", async () => {
    repo.findInvitationByTokenHash.mockResolvedValue([])
    await expect(
      acceptInvitationUseCase(validCtx, validDeps, "b".repeat(20))
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
  })

  it("rejects an expired invitation with NOT_FOUND", async () => {
    repo.findInvitationByTokenHash.mockResolvedValue([
      { ...invite, expiresAt: new Date(Date.now() - 1) },
    ])
    await expect(
      acceptInvitationUseCase(validCtx, validDeps, "a".repeat(20))
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
  })

  it("rejects an already-used invitation with CONFLICT", async () => {
    repo.findInvitationByTokenHash.mockResolvedValue([
      { ...invite, status: "accepted" },
    ])
    await expect(
      acceptInvitationUseCase(validCtx, validDeps, "a".repeat(20))
    ).rejects.toMatchObject({ code: "CONFLICT" })
  })

  it("rejects a concurrent claim with CONFLICT", async () => {
    repo.claimInvitationAndUpsertMember.mockResolvedValue(false)
    await expect(
      acceptInvitationUseCase(validCtx, validDeps, "a".repeat(20))
    ).rejects.toMatchObject({ code: "CONFLICT" })
  })

  it("rejects a wrong signed-in email with FORBIDDEN", async () => {
    await expect(
      acceptInvitationUseCase(
        { userId: "user-1", email: "other@example.com" },
        validDeps,
        "a".repeat(20)
      )
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
  })

  it("rejects an inactive workspace with NOT_FOUND", async () => {
    repo.findOrganizationById.mockResolvedValue([
      { slug: "acme", status: "inactive" },
    ])
    await expect(
      acceptInvitationUseCase(validCtx, validDeps, "a".repeat(20))
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
  })

  it("does not leak whether the workspace or invitation exists for inactive workspace", async () => {
    repo.findOrganizationById.mockResolvedValue([
      { slug: "acme", status: "inactive" },
    ])
    const error = await acceptInvitationUseCase(
      validCtx,
      validDeps,
      "a".repeat(20)
    ).catch((e) => e)
    expect(error.code).toBe("NOT_FOUND")
    expect(error.message).toBe("This invitation is invalid or expired.")
  })

  it("does not leak whether the workspace or invitation exists for unknown token", async () => {
    repo.findInvitationByTokenHash.mockResolvedValue([])
    const error = await acceptInvitationUseCase(
      validCtx,
      validDeps,
      "b".repeat(20)
    ).catch((e) => e)
    expect(error.code).toBe("NOT_FOUND")
    expect(error.message).toBe("This invitation is invalid or expired.")
  })
})
