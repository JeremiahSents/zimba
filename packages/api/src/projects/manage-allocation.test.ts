import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  createAllocation: vi.fn(),
  findActiveProjectForOrganization: vi.fn(),
  updateAllocation: vi.fn(),
}))
vi.mock("@workspace/db/repositories", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(callback: (tx: unknown) => Promise<Result>): Promise<Result> =>
      callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import {
  createAllocationUseCase,
  updateAllocationUseCase,
} from "./manage-allocation"

const context = {
  userId: "user-1",
  organizationId: "org-1",
  role: "site_manager" as const,
}

describe("allocation use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.findActiveProjectForOrganization.mockResolvedValue([
      { id: "project-1" },
    ])
    repo.createAllocation.mockResolvedValue({ id: "allocation-1" })
    repo.updateAllocation.mockResolvedValue({ id: "allocation-1" })
  })

  it("creates only within an active tenant project", async () => {
    await createAllocationUseCase(context, "project-1", {
      name: "Foundation",
      budget: 100,
    })
    expect(repo.createAllocation).toHaveBeenCalledWith(
      dbMock,
      expect.objectContaining({
        organizationId: "org-1",
        projectId: "project-1",
        budgetCents: 10000,
      })
    )
  })

  it("rejects a project outside the workspace", async () => {
    repo.findActiveProjectForOrganization.mockResolvedValue([])
    await expect(
      createAllocationUseCase(context, "other", { name: "X", budget: 1 })
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
    expect(repo.createAllocation).not.toHaveBeenCalled()
  })

  it("requires a valid update payload", async () => {
    await expect(
      updateAllocationUseCase(context, "project-1", "allocation-1", {})
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
  })
})
