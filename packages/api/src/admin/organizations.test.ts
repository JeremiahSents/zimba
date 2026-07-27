import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  findOrganizationDetail: vi.fn(),
  listOrganizationsWithStats: vi.fn(),
  readOrganizationStats: vi.fn(),
  updateOrganizationStatus: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import {
  getOrganizationDetailUseCase,
  getOrganizationStatsUseCase,
  listOrganizationsUseCase,
  updateOrganizationStatusUseCase,
} from "./organizations"

describe("admin organization use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("lists organizations with stats", async () => {
    repo.listOrganizationsWithStats.mockReturnValue("organizations")

    expect(listOrganizationsUseCase()).toBe("organizations")
    expect(repo.listOrganizationsWithStats).toHaveBeenCalledWith(dbMock)
  })

  it("returns organization detail when found", async () => {
    repo.findOrganizationDetail.mockResolvedValue({ id: "org-1" })

    await expect(getOrganizationDetailUseCase("org-1")).resolves.toEqual({
      id: "org-1",
    })
  })

  it("throws not found when organization detail is missing", async () => {
    repo.findOrganizationDetail.mockResolvedValue(null)

    await expect(getOrganizationDetailUseCase("missing")).rejects.toMatchObject(
      { code: "NOT_FOUND" }
    )
  })

  it("delegates organization stats and status updates", () => {
    repo.readOrganizationStats.mockReturnValue("stats")
    repo.updateOrganizationStatus.mockReturnValue("updated")

    expect(getOrganizationStatsUseCase("org-1")).toBe("stats")
    expect(updateOrganizationStatusUseCase("org-1", "suspended")).toBe(
      "updated"
    )
    expect(repo.readOrganizationStats).toHaveBeenCalledWith(dbMock, "org-1")
    expect(repo.updateOrganizationStatus).toHaveBeenCalledWith(
      dbMock,
      "org-1",
      "suspended"
    )
  })
})
