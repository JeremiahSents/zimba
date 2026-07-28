import { beforeEach, describe, expect, it, vi } from "vitest"
import { ApplicationError } from "../../src/shared/application-error"

const orgRepo = vi.hoisted(() => ({
  findOrganizationById: vi.fn(),
}))
vi.mock("@workspace/db/organizations", () => orgRepo)

const platformRepo = vi.hoisted(() => ({
  findPlatformUserForUser: vi.fn(),
  findActiveGrantForUser: vi.fn(),
  findActiveGrantForUserAndOrg: vi.fn(),
  insertGrant: vi.fn(),
  revokeGrantsForUser: vi.fn(),
  revokeGrantById: vi.fn(),
  appendPlatformAudit: vi.fn(),
}))
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
  getActiveWorkspaceGrantUseCase,
  grantWorkspaceAccessUseCase,
  isPlatformStaffUseCase,
  revokeGrantByIdUseCase,
  revokeWorkspaceAccessUseCase,
  WORKSPACE_GRANT_TTL_MINUTES,
} from "../../src/admin/workspace-access"

describe("grantWorkspaceAccessUseCase", () => {
  beforeEach(() => vi.resetAllMocks())

  it("grants time-boxed access for a super admin", async () => {
    platformRepo.findPlatformUserForUser.mockResolvedValue([
      { id: "pu-1", userId: "admin-1", role: "super_admin" },
    ])
    orgRepo.findOrganizationById.mockResolvedValue([
      { id: "org-1", slug: "acme-ltd" },
    ])
    platformRepo.insertGrant.mockResolvedValue([{ id: "grant-1" }])
    platformRepo.revokeGrantsForUser.mockResolvedValue([])
    platformRepo.appendPlatformAudit.mockResolvedValue([])

    const before = Date.now()
    const result = await grantWorkspaceAccessUseCase({
      actorId: "admin-1",
      organizationId: "org-1",
    })

    expect(result.slug).toBe("acme-ltd")

    // The expiry is the security control, so pin it rather than trusting the UI.
    const ttlMs = WORKSPACE_GRANT_TTL_MINUTES * 60 * 1000
    expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(before + ttlMs)
    expect(result.expiresAt.getTime()).toBeLessThanOrEqual(
      Date.now() + ttlMs + 1000
    )

    const inserted = platformRepo.insertGrant.mock.calls[0]?.[1]
    expect(inserted).toMatchObject({
      userId: "admin-1",
      organizationId: "org-1",
      role: "owner",
    })
    expect(inserted.expiresAt).toBeInstanceOf(Date)
  })

  it("closes any previously open workspace before opening a new one", async () => {
    platformRepo.findPlatformUserForUser.mockResolvedValue([
      { id: "pu-1", userId: "admin-1", role: "super_admin" },
    ])
    orgRepo.findOrganizationById.mockResolvedValue([
      { id: "org-2", slug: "beta-ltd" },
    ])
    platformRepo.insertGrant.mockResolvedValue([{ id: "grant-2" }])
    platformRepo.revokeGrantsForUser.mockResolvedValue([])
    platformRepo.appendPlatformAudit.mockResolvedValue([])

    await grantWorkspaceAccessUseCase({
      actorId: "admin-1",
      organizationId: "org-2",
    })

    const revokeOrder =
      platformRepo.revokeGrantsForUser.mock.invocationCallOrder[0] ?? 0
    const insertOrder = platformRepo.insertGrant.mock.invocationCallOrder[0] ?? 0
    expect(revokeOrder).toBeLessThan(insertOrder)
  })

  it("rejects non-super-admin actors", async () => {
    platformRepo.findPlatformUserForUser.mockResolvedValue([
      { id: "pu-1", userId: "user-1", role: "support" },
    ])

    await expect(
      grantWorkspaceAccessUseCase({
        actorId: "user-1",
        organizationId: "org-1",
      })
    ).rejects.toThrow(ApplicationError)
    expect(platformRepo.insertGrant).not.toHaveBeenCalled()
  })

  it("rejects when organization does not exist", async () => {
    platformRepo.findPlatformUserForUser.mockResolvedValue([
      { id: "pu-1", userId: "admin-1", role: "super_admin" },
    ])
    orgRepo.findOrganizationById.mockResolvedValue([])

    await expect(
      grantWorkspaceAccessUseCase({
        actorId: "admin-1",
        organizationId: "org-999",
      })
    ).rejects.toThrow(ApplicationError)
  })
})

describe("revokeWorkspaceAccessUseCase", () => {
  beforeEach(() => vi.resetAllMocks())

  it("revokes the active grant and records it", async () => {
    platformRepo.findActiveGrantForUser.mockResolvedValue([
      {
        id: "grant-1",
        userId: "admin-1",
        organizationId: "org-1",
        role: "owner",
        expiresAt: new Date(Date.now() + 60_000),
      },
    ])
    platformRepo.revokeGrantsForUser.mockResolvedValue([])
    platformRepo.appendPlatformAudit.mockResolvedValue([])

    await revokeWorkspaceAccessUseCase({ actorId: "admin-1" })

    expect(platformRepo.revokeGrantsForUser).toHaveBeenCalled()
    expect(platformRepo.appendPlatformAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        actorId: "admin-1",
        operation: "workspace_access.revoked",
      })
    )
  })

  it("stays silent when there is nothing to revoke", async () => {
    platformRepo.findActiveGrantForUser.mockResolvedValue([])
    platformRepo.revokeGrantsForUser.mockResolvedValue([])

    // Giving up access must never be the call that fails.
    await expect(
      revokeWorkspaceAccessUseCase({ actorId: "admin-1" })
    ).resolves.toBeUndefined()
    expect(platformRepo.appendPlatformAudit).not.toHaveBeenCalled()
  })
})

describe("getActiveWorkspaceGrantUseCase", () => {
  beforeEach(() => vi.resetAllMocks())

  it("returns the active grant", async () => {
    platformRepo.findActiveGrantForUser.mockResolvedValue([
      {
        id: "grant-1",
        organizationId: "org-1",
        organizationName: "Acme Ltd",
        slug: "acme-ltd",
        role: "owner",
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
      },
    ])

    const result = await getActiveWorkspaceGrantUseCase("admin-1")
    expect(result?.organizationId).toBe("org-1")
    expect(result?.slug).toBe("acme-ltd")
  })

  it("returns null when no grant exists", async () => {
    platformRepo.findActiveGrantForUser.mockResolvedValue([])

    const result = await getActiveWorkspaceGrantUseCase("admin-1")
    expect(result).toBeNull()
  })
})

describe("isPlatformStaffUseCase", () => {
  beforeEach(() => vi.resetAllMocks())

  it("is true for a platform user", async () => {
    platformRepo.findPlatformUserForUser.mockResolvedValue([
      { id: "pu-1", userId: "admin-1", role: "support" },
    ])
    await expect(isPlatformStaffUseCase("admin-1")).resolves.toBe(true)
  })

  it("is false for a regular customer", async () => {
    platformRepo.findPlatformUserForUser.mockResolvedValue([])
    await expect(isPlatformStaffUseCase("user-1")).resolves.toBe(false)
  })
})

describe("revokeGrantByIdUseCase", () => {
  beforeEach(() => vi.resetAllMocks())

  it("revokes a specific grant by ID", async () => {
    platformRepo.findPlatformUserForUser.mockResolvedValue([
      { id: "pu-1", userId: "admin-1", role: "super_admin" },
    ])
    platformRepo.revokeGrantById.mockResolvedValue([])
    platformRepo.appendPlatformAudit.mockResolvedValue([])

    await revokeGrantByIdUseCase({
      actorId: "admin-1",
      grantId: "grant-1",
    })

    expect(platformRepo.revokeGrantById).toHaveBeenCalled()
    expect(platformRepo.appendPlatformAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        actorId: "admin-1",
        operation: "workspace_access.revoked",
      })
    )
  })

  it("rejects non-super-admin actors", async () => {
    platformRepo.findPlatformUserForUser.mockResolvedValue([
      { id: "pu-1", userId: "user-1", role: "support" },
    ])

    await expect(
      revokeGrantByIdUseCase({ actorId: "user-1", grantId: "grant-1" })
    ).rejects.toThrow(ApplicationError)
    expect(platformRepo.revokeGrantById).not.toHaveBeenCalled()
  })
})
