import type { DatabaseTransaction } from "@workspace/db/executor"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  appendPlatformAudit: vi.fn(),
  claimPlatformInvitation: vi.fn(),
  countSuperAdmins: vi.fn(),
  createPlatformAccess: vi.fn(),
  createPlatformInvitation: vi.fn(),
  deletePlatformAccess: vi.fn(),
  findPlatformAccessForUser: vi.fn(),
  findPlatformInvitationByTokenHash: vi.fn(),
  findPlatformUserForUser: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  revokePendingPlatformInvitationsForEmail: vi.fn(),
  updatePlatformAccess: vi.fn(),
}))

vi.mock("@workspace/db/auth", () => repo)
vi.mock("@workspace/db/platform", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import {
  acceptSuperAdminInviteUseCase,
  createSuperAdminInviteUseCase,
  removePlatformUserUseCase,
  updatePlatformUserRoleUseCase,
} from "../../src/admin/users"

describe("admin platform user use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    dbMock.transaction.mockImplementation(
      async <Result>(
        callback: (tx: DatabaseTransaction) => Promise<Result>
      ): Promise<Result> => callback({} as DatabaseTransaction)
    )
    repo.findUserById.mockResolvedValue([{ id: "existing-user" }])
    repo.findPlatformAccessForUser.mockImplementation((_, userId: string) =>
      userId === "actor-1" ? [{ id: "actor-access", role: "super_admin" }] : []
    )
    repo.findPlatformUserForUser.mockResolvedValue([])
    repo.findUserByEmail.mockResolvedValue([])
    repo.createPlatformInvitation.mockResolvedValue([{ id: "invite-1" }])
    repo.claimPlatformInvitation.mockResolvedValue([{ id: "invite-1" }])
  })

  it("rejects changing your own platform access", async () => {
    await expect(
      updatePlatformUserRoleUseCase("user-1", "user-1", "support")
    ).rejects.toThrow("You cannot change your own platform access.")
  })

  it("rejects a support user calling the service directly", async () => {
    repo.findPlatformAccessForUser.mockReturnValue([
      { id: "support-access", role: "support" },
    ])

    await expect(
      updatePlatformUserRoleUseCase("support-1", "target-1", "support")
    ).rejects.toThrow("Only super admins can change platform access.")
    expect(repo.updatePlatformAccess).not.toHaveBeenCalled()
  })

  it("protects the final super administrator", async () => {
    repo.findPlatformAccessForUser.mockImplementation((_, userId: string) =>
      userId === "actor-1"
        ? [{ id: "actor-access", role: "super_admin" }]
        : [{ id: "platform-1", role: "super_admin" }]
    )
    repo.countSuperAdmins.mockResolvedValue([{ value: 1 }])

    await expect(
      removePlatformUserUseCase("actor-1", "target-1")
    ).rejects.toThrow("At least one super admin must remain.")
    expect(repo.deletePlatformAccess).not.toHaveBeenCalled()
    expect(repo.appendPlatformAudit).not.toHaveBeenCalled()
  })

  it("updates a role and writes its audit event in one transaction", async () => {
    repo.findPlatformAccessForUser.mockImplementation((_, userId: string) =>
      userId === "actor-1"
        ? [{ id: "actor-access", role: "super_admin" }]
        : [{ id: "platform-1", role: "support" }]
    )

    await updatePlatformUserRoleUseCase("actor-1", "target-1", "super_admin")

    expect(dbMock.transaction).toHaveBeenCalledOnce()
    expect(repo.updatePlatformAccess).toHaveBeenCalledWith(
      expect.anything(),
      "platform-1",
      "super_admin"
    )
    expect(repo.appendPlatformAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        actorId: "actor-1",
        targetUserId: "target-1",
        oldRole: "support",
        newRole: "super_admin",
      })
    )
  })

  it("creates a super admin invite and revokes older pending invites", async () => {
    repo.findUserByEmail.mockResolvedValue([{ id: "target-user" }])

    const result = await createSuperAdminInviteUseCase("actor-1", {
      email: "Person@Example.com",
      name: "Person",
    })

    expect(result.normalizedEmail).toBe("person@example.com")
    expect(result.token).toEqual(expect.any(String))
    expect(repo.revokePendingPlatformInvitationsForEmail).toHaveBeenCalledWith(
      expect.anything(),
      "person@example.com"
    )
    expect(repo.createPlatformInvitation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        email: "person@example.com",
        name: "Person",
        role: "super_admin",
        invitedById: "actor-1",
        tokenHash: expect.any(String),
        expiresAt: expect.any(Date),
      })
    )
    expect(repo.appendPlatformAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        actorId: "actor-1",
        targetUserId: "target-user",
        operation: "super_admin_invite_sent",
      })
    )
  })

  it("accepts a super admin invite and grants access", async () => {
    repo.findPlatformInvitationByTokenHash.mockResolvedValue([
      {
        id: "invite-1",
        email: "person@example.com",
        name: "Person",
        role: "super_admin",
        tokenHash: "token-hash",
        status: "pending",
        invitedById: "actor-1",
        expiresAt: new Date(Date.now() + 60_000),
        acceptedAt: null,
        createdAt: new Date(),
      },
    ])
    repo.findPlatformAccessForUser.mockResolvedValue([])

    await acceptSuperAdminInviteUseCase(
      { userId: "target-user", email: "Person@Example.com" },
      "x".repeat(32)
    )

    expect(repo.claimPlatformInvitation).toHaveBeenCalledWith(
      expect.anything(),
      "invite-1"
    )
    expect(repo.createPlatformAccess).toHaveBeenCalledWith(
      expect.anything(),
      "target-user",
      "super_admin"
    )
    expect(repo.appendPlatformAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        operation: "super_admin_invite_accepted",
        targetUserId: "target-user",
      })
    )
  })

  it("rejects invites for existing platform users", async () => {
    repo.findUserByEmail.mockResolvedValue([{ id: "target-1" }])
    repo.findPlatformUserForUser.mockResolvedValue([{ id: "platform-1" }])

    await expect(
      createSuperAdminInviteUseCase("actor-1", {
        email: "person@example.com",
        name: "Person",
      })
    ).rejects.toThrow("This user already has platform access.")
  })
})
