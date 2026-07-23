import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const transaction = vi.fn(
  async <Result>(callback: (transaction: object) => Promise<Result>) =>
    callback({})
)

vi.mock("@workspace/db", () => ({
  db: { transaction },
}))

vi.mock("@workspace/db/repositories", () => ({
  appendPlatformAudit: vi.fn(),
  countSuperAdmins: vi.fn(),
  createPlatformAccess: vi.fn(),
  deletePlatformAccess: vi.fn(),
  findPlatformAccessForUser: vi.fn(),
  findPlatformUserDetailRows: vi.fn(),
  findUserById: vi.fn(),
  listPlatformUserRows: vi.fn(),
  updatePlatformAccess: vi.fn(),
}))

const repositories = await import("@workspace/db/repositories")
const { removePlatformUser, updatePlatformUserRole } = await import("./service")

describe("platform user authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(repositories.findUserById).mockResolvedValue([
      { id: "existing-user" },
    ] as never)
    vi.mocked(repositories.findPlatformAccessForUser).mockImplementation(((
      _executor: unknown,
      userId: string
    ) =>
      userId === "actor-1"
        ? [{ id: "actor-access", role: "super_admin" }]
        : []) as never)
  })

  it("rejects changing your own platform access", async () => {
    await expect(
      updatePlatformUserRole("user-1", "user-1", "support")
    ).rejects.toThrow("You cannot change your own platform access.")
  })

  it("rejects a support user calling the service directly", async () => {
    vi.mocked(repositories.findPlatformAccessForUser).mockReturnValue([
      { id: "support-access", role: "support" },
    ] as never)

    await expect(
      updatePlatformUserRole("support-1", "target-1", "support")
    ).rejects.toThrow("Only super admins can change platform access.")
    expect(repositories.updatePlatformAccess).not.toHaveBeenCalled()
  })

  it("protects the final super administrator", async () => {
    vi.mocked(repositories.findPlatformAccessForUser).mockImplementation(((
      _executor: unknown,
      userId: string
    ) =>
      userId === "actor-1"
        ? [{ id: "actor-access", role: "super_admin" }]
        : [{ id: "platform-1", role: "super_admin" }]) as never)
    vi.mocked(repositories.countSuperAdmins).mockResolvedValue([{ value: 1 }])

    await expect(removePlatformUser("actor-1", "target-1")).rejects.toThrow(
      "At least one super admin must remain."
    )
    expect(repositories.deletePlatformAccess).not.toHaveBeenCalled()
    expect(repositories.appendPlatformAudit).not.toHaveBeenCalled()
  })

  it("updates a role and writes its audit event in one transaction", async () => {
    vi.mocked(repositories.findPlatformAccessForUser).mockImplementation(((
      _executor: unknown,
      userId: string
    ) =>
      userId === "actor-1"
        ? [{ id: "actor-access", role: "super_admin" }]
        : [{ id: "platform-1", role: "support" }]) as never)

    await updatePlatformUserRole("actor-1", "target-1", "super_admin")

    expect(transaction).toHaveBeenCalledOnce()
    expect(repositories.updatePlatformAccess).toHaveBeenCalledWith(
      expect.anything(),
      "platform-1",
      "super_admin"
    )
    expect(repositories.appendPlatformAudit).toHaveBeenCalledWith(
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
    vi.mocked(repositories.findPlatformAccessForUser).mockImplementation(((
      _executor: unknown,
      userId: string
    ) =>
      userId === "actor-1"
        ? [{ id: "actor-access", role: "super_admin" }]
        : [{ id: "platform-1", role: "support" }]) as never)

    await removePlatformUser("actor-1", "target-1")

    expect(repositories.deletePlatformAccess).toHaveBeenCalledWith(
      expect.anything(),
      "platform-1"
    )
    expect(repositories.appendPlatformAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        operation: "platform_access_removed",
        oldRole: "support",
        newRole: null,
      })
    )
  })
})
