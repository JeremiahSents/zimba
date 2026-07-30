import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

vi.mock("@workspace/api", () => ({
  deactivateUserAccountUseCase: vi.fn(),
  deleteUserAccountUseCase: vi.fn(),
  getAccountRemovalPreviewUseCase: vi.fn(),
  reactivateUserAccountUseCase: vi.fn(),
  removePlatformUserUseCase: vi.fn(),
  updatePlatformUserRoleUseCase: vi.fn(),
}))

const api = await import("@workspace/api")
const {
  deactivateUserAccount,
  deleteUserAccount,
  getAccountRemovalPreview,
  reactivateUserAccount,
  removePlatformUser,
  updatePlatformUserRole,
} = await import("@/core/users/service")

describe("platform user authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.updatePlatformUserRoleUseCase).mockResolvedValue(undefined)
    vi.mocked(api.removePlatformUserUseCase).mockResolvedValue(undefined)
  })

  it("delegates role updates to the API use case", async () => {
    await updatePlatformUserRole("actor-1", "target-1", "super_admin")

    expect(api.updatePlatformUserRoleUseCase).toHaveBeenCalledWith(
      "actor-1",
      "target-1",
      "super_admin"
    )
  })

  it("delegates removals to the API use case", async () => {
    await removePlatformUser("actor-1", "target-1")

    expect(api.removePlatformUserUseCase).toHaveBeenCalledWith(
      "actor-1",
      "target-1"
    )
  })
})

describe("account removal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.deactivateUserAccountUseCase).mockResolvedValue({
      email: "ada@example.com",
    })
    vi.mocked(api.reactivateUserAccountUseCase).mockResolvedValue({
      email: "ada@example.com",
    })
    vi.mocked(api.deleteUserAccountUseCase).mockResolvedValue({
      email: "ada@example.com",
    })
    vi.mocked(api.getAccountRemovalPreviewUseCase).mockResolvedValue(null)
  })

  it("passes the actor, target and reason through to deactivation", async () => {
    await deactivateUserAccount("actor-1", "target-1", "Left the company")

    expect(api.deactivateUserAccountUseCase).toHaveBeenCalledWith(
      "actor-1",
      "target-1",
      "Left the company"
    )
  })

  it("delegates reactivation", async () => {
    await reactivateUserAccount("actor-1", "target-1")

    expect(api.reactivateUserAccountUseCase).toHaveBeenCalledWith(
      "actor-1",
      "target-1"
    )
  })

  it("forwards the typed confirmation email for the use case to check", async () => {
    await deleteUserAccount("actor-1", "target-1", "ada@example.com")

    expect(api.deleteUserAccountUseCase).toHaveBeenCalledWith(
      "actor-1",
      "target-1",
      "ada@example.com"
    )
  })

  it("delegates the removal preview", async () => {
    await getAccountRemovalPreview("actor-1", "target-1")

    expect(api.getAccountRemovalPreviewUseCase).toHaveBeenCalledWith(
      "actor-1",
      "target-1"
    )
  })
})
