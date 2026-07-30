import { beforeEach, describe, expect, it, vi } from "vitest"

const authRepo = vi.hoisted(() => ({
  deactivateUser: vi.fn(),
  deleteSessionsForUser: vi.fn(),
  deleteUser: vi.fn(),
  findAccountSummary: vi.fn(),
  findUserForUpdate: vi.fn(),
  reactivateUser: vi.fn(),
}))

const organizationRepo = vi.hoisted(() => ({
  countPendingInvitationsFromUser: vi.fn(),
  findSoleOwnerOrganizationsForUser: vi.fn(),
}))

const platformRepo = vi.hoisted(() => ({
  appendPlatformAudit: vi.fn(),
  countSuperAdmins: vi.fn(),
  findPlatformAccessForUser: vi.fn(),
  revokeGrantsForUser: vi.fn(),
}))

vi.mock("@workspace/db/auth", () => authRepo)
vi.mock("@workspace/db/organizations", () => organizationRepo)
vi.mock("@workspace/db/platform", () => platformRepo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import {
  deactivateUserAccountUseCase,
  deleteUserAccountUseCase,
  getAccountRemovalPreviewUseCase,
  reactivateUserAccountUseCase,
} from "../../src/admin/account-removal"

const actorId = "actor-1"
const targetId = "target-1"

const target = {
  id: targetId,
  name: "Ada Nakato",
  email: "ada@example.com",
  createdAt: new Date("2026-01-05T00:00:00.000Z"),
  deactivatedAt: null,
  deactivatedBy: null,
  deactivationReason: null,
}

/** Nothing standing in the way of a delete. */
function allowDeletion() {
  authRepo.findUserForUpdate.mockResolvedValue([target])
  authRepo.findAccountSummary.mockResolvedValue([target])
  organizationRepo.findSoleOwnerOrganizationsForUser.mockResolvedValue([])
  organizationRepo.countPendingInvitationsFromUser.mockResolvedValue(0)
  platformRepo.findPlatformAccessForUser.mockImplementation(
    async (_executor: unknown, userId: string) =>
      userId === actorId ? [{ id: "pa-1", role: "super_admin" }] : []
  )
  platformRepo.countSuperAdmins.mockResolvedValue([{ value: 2 }])
}

describe("account removal preview", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    dbMock.transaction.mockImplementation(async (callback) => callback({}))
  })

  it("returns null for an account that does not exist", async () => {
    authRepo.findAccountSummary.mockResolvedValue([])

    await expect(
      getAccountRemovalPreviewUseCase(actorId, targetId)
    ).resolves.toBeNull()
  })

  it("allows deletion when nothing depends on the account", async () => {
    allowDeletion()

    const preview = await getAccountRemovalPreviewUseCase(actorId, targetId)

    expect(preview).toMatchObject({ canDelete: true, blockers: [] })
  })

  it("blocks deletion while the user is an organization's only owner", async () => {
    allowDeletion()
    organizationRepo.findSoleOwnerOrganizationsForUser.mockResolvedValue([
      {
        organizationId: "org-1",
        organizationName: "Kampala Builders",
        slug: "kampala-builders",
        status: "active",
      },
    ])

    const preview = await getAccountRemovalPreviewUseCase(actorId, targetId)

    expect(preview?.canDelete).toBe(false)
    expect(preview?.blockers).toEqual([
      expect.objectContaining({ code: "SOLE_OWNER", organizationId: "org-1" }),
    ])
  })

  it("blocks deletion of the last super admin", async () => {
    allowDeletion()
    platformRepo.findPlatformAccessForUser.mockResolvedValue([
      { id: "pa-1", role: "super_admin" },
    ])
    platformRepo.countSuperAdmins.mockResolvedValue([{ value: 1 }])

    const preview = await getAccountRemovalPreviewUseCase(actorId, targetId)

    expect(preview?.blockers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "LAST_SUPER_ADMIN" }),
      ])
    )
  })

  it("blocks deletion while invitations the user sent are open", async () => {
    allowDeletion()
    organizationRepo.countPendingInvitationsFromUser.mockResolvedValue(2)

    const preview = await getAccountRemovalPreviewUseCase(actorId, targetId)

    expect(preview?.blockers).toEqual([
      expect.objectContaining({ code: "PENDING_INVITATIONS" }),
    ])
  })

  it("blocks an admin from deleting themselves", async () => {
    allowDeletion()

    const preview = await getAccountRemovalPreviewUseCase(targetId, targetId)

    expect(preview?.blockers).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "SELF" })])
    )
  })
})

describe("permanent deletion", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    dbMock.transaction.mockImplementation(async (callback) => callback({}))
  })

  it("deletes the account and records a tombstone that survives the row", async () => {
    allowDeletion()
    authRepo.deleteUser.mockResolvedValue({
      id: targetId,
      email: target.email,
    })

    await expect(
      deleteUserAccountUseCase(actorId, targetId, "ada@example.com")
    ).resolves.toEqual({ email: target.email })

    // targetUserId must be null: the cascade would blank it anyway, so the
    // identity of the deleted account has to live in the metadata.
    expect(platformRepo.appendPlatformAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        actorId,
        targetUserId: null,
        operation: "user_account_deleted",
        metadata: expect.objectContaining({
          deletedUserId: targetId,
          email: target.email,
        }),
      })
    )
    expect(authRepo.deleteUser).toHaveBeenCalled()
  })

  it("accepts the confirmation email in any casing", async () => {
    allowDeletion()
    authRepo.deleteUser.mockResolvedValue({ id: targetId, email: target.email })

    await expect(
      deleteUserAccountUseCase(actorId, targetId, "  ADA@Example.com ")
    ).resolves.toEqual({ email: target.email })
  })

  it("refuses a mismatched confirmation email without touching the row", async () => {
    allowDeletion()

    await expect(
      deleteUserAccountUseCase(actorId, targetId, "someone-else@example.com")
    ).rejects.toThrow(/confirmation email does not match/i)
    expect(authRepo.deleteUser).not.toHaveBeenCalled()
  })

  it("refuses when a blocker stands, even with the right email", async () => {
    allowDeletion()
    organizationRepo.findSoleOwnerOrganizationsForUser.mockResolvedValue([
      {
        organizationId: "org-1",
        organizationName: "Kampala Builders",
        slug: "kampala-builders",
        status: "active",
      },
    ])

    await expect(
      deleteUserAccountUseCase(actorId, targetId, target.email)
    ).rejects.toThrow(/no other owner/i)
    expect(authRepo.deleteUser).not.toHaveBeenCalled()
  })

  it("refuses when the actor is not a super admin", async () => {
    allowDeletion()
    platformRepo.findPlatformAccessForUser.mockResolvedValue([
      { id: "pa-2", role: "support" },
    ])

    await expect(
      deleteUserAccountUseCase(actorId, targetId, target.email)
    ).rejects.toThrow(/only super admins/i)
    expect(authRepo.deleteUser).not.toHaveBeenCalled()
  })

  it("refuses to let an admin delete their own account", async () => {
    allowDeletion()

    await expect(
      deleteUserAccountUseCase(targetId, targetId, target.email)
    ).rejects.toThrow(/your own account/i)
    expect(authRepo.deleteUser).not.toHaveBeenCalled()
  })
})

describe("deactivation", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    dbMock.transaction.mockImplementation(async (callback) => callback({}))
  })

  it("stamps the account, ends every session and revokes workspace grants", async () => {
    allowDeletion()
    authRepo.deactivateUser.mockResolvedValue({
      id: targetId,
      email: target.email,
    })

    await expect(
      deactivateUserAccountUseCase(actorId, targetId, "  Left the company  ")
    ).resolves.toEqual({ email: target.email })

    expect(authRepo.deactivateUser).toHaveBeenCalledWith(
      expect.anything(),
      targetId,
      { deactivatedBy: actorId, reason: "Left the company" }
    )
    expect(authRepo.deleteSessionsForUser).toHaveBeenCalled()
    expect(platformRepo.revokeGrantsForUser).toHaveBeenCalled()
    expect(platformRepo.appendPlatformAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ operation: "user_account_deactivated" })
    )
  })

  it("does not deactivate an account that is already deactivated", async () => {
    allowDeletion()
    authRepo.findUserForUpdate.mockResolvedValue([
      { ...target, deactivatedAt: new Date("2026-07-01T00:00:00.000Z") },
    ])

    await expect(
      deactivateUserAccountUseCase(actorId, targetId)
    ).rejects.toThrow(/already deactivated/i)
    expect(authRepo.deactivateUser).not.toHaveBeenCalled()
  })

  it("refuses to lock out the last super admin", async () => {
    allowDeletion()
    platformRepo.findPlatformAccessForUser.mockResolvedValue([
      { id: "pa-1", role: "super_admin" },
    ])
    platformRepo.countSuperAdmins.mockResolvedValue([{ value: 1 }])

    await expect(
      deactivateUserAccountUseCase(actorId, targetId)
    ).rejects.toThrow(/at least one super admin/i)
    expect(authRepo.deactivateUser).not.toHaveBeenCalled()
  })

  it("clears the stamp on reactivation", async () => {
    allowDeletion()
    authRepo.findUserForUpdate.mockResolvedValue([
      { ...target, deactivatedAt: new Date("2026-07-01T00:00:00.000Z") },
    ])
    authRepo.reactivateUser.mockResolvedValue({
      id: targetId,
      email: target.email,
    })

    await expect(
      reactivateUserAccountUseCase(actorId, targetId)
    ).resolves.toEqual({ email: target.email })
    expect(platformRepo.appendPlatformAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ operation: "user_account_reactivated" })
    )
  })

  it("does not reactivate an account that is already active", async () => {
    allowDeletion()

    await expect(
      reactivateUserAccountUseCase(actorId, targetId)
    ).rejects.toThrow(/already active/i)
    expect(authRepo.reactivateUser).not.toHaveBeenCalled()
  })
})
