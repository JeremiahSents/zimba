import type { DatabaseExecutor } from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  findOrganizationDetail: vi.fn(),
  listOrganizationsWithStats: vi.fn(),
  readOrganizationStats: vi.fn(),
  updateOrganizationStatus: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import {
  getOrganizationDetailUseCase,
  getOrganizationStatsUseCase,
  listOrganizationsUseCase,
  updateOrganizationStatusUseCase,
} from "./organizations"

const deps = { executor: {} as DatabaseExecutor }

describe("admin organization use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("lists organizations with stats", async () => {
    repo.listOrganizationsWithStats.mockReturnValue("organizations")

    expect(listOrganizationsUseCase(deps)).toBe("organizations")
    expect(repo.listOrganizationsWithStats).toHaveBeenCalledWith(deps.executor)
  })

  it("returns organization detail when found", async () => {
    repo.findOrganizationDetail.mockResolvedValue({ id: "org-1" })

    await expect(getOrganizationDetailUseCase(deps, "org-1")).resolves.toEqual({
      id: "org-1",
    })
  })

  it("throws not found when organization detail is missing", async () => {
    repo.findOrganizationDetail.mockResolvedValue(null)

    await expect(
      getOrganizationDetailUseCase(deps, "missing")
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
  })

  it("delegates organization stats and status updates", () => {
    repo.readOrganizationStats.mockReturnValue("stats")
    repo.updateOrganizationStatus.mockReturnValue("updated")

    expect(getOrganizationStatsUseCase(deps, "org-1")).toBe("stats")
    expect(updateOrganizationStatusUseCase(deps, "org-1", "suspended")).toBe(
      "updated"
    )
    expect(repo.readOrganizationStats).toHaveBeenCalledWith(
      deps.executor,
      "org-1"
    )
    expect(repo.updateOrganizationStatus).toHaveBeenCalledWith(
      deps.executor,
      "org-1",
      "suspended"
    )
  })
})
