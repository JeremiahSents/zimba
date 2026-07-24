import type {
  DatabaseTransaction,
  TransactionRunner,
} from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  appendPlatformAudit: vi.fn(),
  countSuperAdmins: vi.fn(),
  createPlatformAccess: vi.fn(),
  deletePlatformAccess: vi.fn(),
  findPlatformAccessForUser: vi.fn(),
  findPlatformUserForUser: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  updatePlatformAccess: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import {
  removePlatformUserUseCase,
  updatePlatformUserRoleUseCase,
  validateSuperAdminInviteUseCase,
} from "./users"

const transactionMock = vi.fn(
  async <Result>(
    callback: (tx: DatabaseTransaction) => Promise<Result>
  ): Promise<Result> => callback({} as DatabaseTransaction)
)
const deps = { transaction: transactionMock as TransactionRunner }

describe("admin platform user use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    transactionMock.mockImplementation(
      async <Result>(
        callback: (tx: DatabaseTransaction) => Promise<Result>
      ): Promise<Result> => callback({} as DatabaseTransaction)
    )
    repo.findUserById.mockResolvedValue([{ id: "existing-user" }])
    repo.findPlatformAccessForUser.mockImplementation((_, userId: string) =>
      userId === "actor-1" ? [{ id: "actor-access", role: "super_admin" }] : []
    )
  })

  it("rejects changing your own platform access", async () => {
    await expect(
      updatePlatformUserRoleUseCase(deps, "user-1", "user-1", "support")
    ).rejects.toThrow("You cannot change your own platform access.")
  })

  it("rejects a support user calling the service directly", async () => {
    repo.findPlatformAccessForUser.mockReturnValue([
      { id: "support-access", role: "support" },
    ])

    await expect(
      updatePlatformUserRoleUseCase(deps, "support-1", "target-1", "support")
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
      removePlatformUserUseCase(deps, "actor-1", "target-1")
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

    await updatePlatformUserRoleUseCase(
      deps,
      "actor-1",
      "target-1",
      "super_admin"
    )

    expect(transactionMock).toHaveBeenCalledOnce()
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

  it("removes support access and records the removal", async () => {
    repo.findPlatformAccessForUser.mockImplementation((_, userId: string) =>
      userId === "actor-1"
        ? [{ id: "actor-access", role: "super_admin" }]
        : [{ id: "platform-1", role: "support" }]
    )

    await removePlatformUserUseCase(deps, "actor-1", "target-1")

    expect(repo.deletePlatformAccess).toHaveBeenCalledWith(
      expect.anything(),
      "platform-1"
    )
    expect(repo.appendPlatformAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        operation: "platform_access_removed",
        oldRole: "support",
        newRole: null,
      })
    )
  })

  it("rejects invites for existing platform users", async () => {
    repo.findUserByEmail.mockResolvedValue([{ id: "target-1" }])
    repo.findPlatformUserForUser.mockResolvedValue([{ id: "platform-1" }])

    await expect(
      validateSuperAdminInviteUseCase(
        { executor: {} as never },
        {
          email: "person@example.com",
          name: "Person",
        }
      )
    ).rejects.toThrow("This user already has platform access.")
  })
})
