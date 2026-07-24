import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const transaction = vi.fn(
  async <Result>(callback: (transaction: object) => Promise<Result>) =>
    callback({})
)

vi.mock("@workspace/db", () => ({
  db: { transaction },
}))

vi.mock("@workspace/api", () => ({
  removePlatformUserUseCase: vi.fn(),
  updatePlatformUserRoleUseCase: vi.fn(),
}))

const api = await import("@workspace/api")
const { removePlatformUser, updatePlatformUserRole } = await import("./service")

describe("platform user authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.updatePlatformUserRoleUseCase).mockResolvedValue(undefined)
    vi.mocked(api.removePlatformUserUseCase).mockResolvedValue(undefined)
  })

  it("delegates role updates to the API use case with a transaction", async () => {
    await updatePlatformUserRole("actor-1", "target-1", "super_admin")

    expect(api.updatePlatformUserRoleUseCase).toHaveBeenCalledWith(
      expect.anything(),
      "actor-1",
      "target-1",
      "super_admin"
    )
    const [{ transaction: runner }] = vi.mocked(
      api.updatePlatformUserRoleUseCase
    ).mock.calls[0] as [
      { transaction: typeof transaction },
      string,
      string,
      string,
    ]
    await runner(async () => undefined)
    expect(transaction).toHaveBeenCalledOnce()
  })

  it("delegates removals to the API use case with a transaction", async () => {
    await removePlatformUser("actor-1", "target-1")

    expect(api.removePlatformUserUseCase).toHaveBeenCalledWith(
      expect.anything(),
      "actor-1",
      "target-1"
    )
  })
})
