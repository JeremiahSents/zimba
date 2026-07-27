import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

vi.mock("@workspace/api", () => ({
  removePlatformUserUseCase: vi.fn(),
  updatePlatformUserRoleUseCase: vi.fn(),
}))

const api = await import("@workspace/api")
const { removePlatformUser, updatePlatformUserRole } = await import("@/core/users/service")

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
