import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  createAllocation: vi.fn(),
  createProject: vi.fn(),
  createProjectAttachment: vi.fn(),
  findFileForOrganization: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import { createProjectWithAllocationsUseCase } from "./create-project"

const context = {
  userId: "user-1",
  organizationId: "org-1",
  role: "owner" as const,
}

describe("createProjectWithAllocationsUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.createProject.mockResolvedValue({
      id: "project-1",
      organizationId: "org-1",
    })
    repo.createAllocation.mockResolvedValue({ id: "allocation-1" })
    repo.findFileForOrganization.mockResolvedValue([
      { status: "completed", purpose: "project_attachment" },
    ])
  })

  it("creates the project and allocations in one transaction", async () => {
    const transaction = vi.fn(
      async (callback: (tx: never) => Promise<unknown>) => callback({} as never)
    )
    const result = await createProjectWithAllocationsUseCase(
      context,
      { executor: {} as never, transaction: transaction as never },
      {
        organizationId: "org-1",
        name: "House",
        location: "Kampala",
        currency: "UGX",
        landSize: "100 sqm",
        buildingType: "residential",
        allocations: [{ name: "Foundation", budget: 1000 }],
      }
    )
    expect(result.id).toBe("project-1")
    expect(transaction).toHaveBeenCalledOnce()
    expect(repo.createAllocation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ projectId: "project-1", budgetCents: 100000 })
    )
  })

  it("rejects a cross-workspace attachment before linking it", async () => {
    repo.findFileForOrganization.mockResolvedValue([])
    const transaction = async (callback: (tx: never) => Promise<unknown>) =>
      callback({} as never)
    await expect(
      createProjectWithAllocationsUseCase(
        context,
        { executor: {} as never, transaction: transaction as never },
        {
          organizationId: "org-1",
          name: "House",
          location: "Kampala",
          currency: "UGX",
          landSize: "100 sqm",
          buildingType: "residential",
          allocations: [{ name: "Foundation", budget: 1000 }],
          attachmentIds: ["other-file"],
        }
      )
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(repo.createProjectAttachment).not.toHaveBeenCalled()
  })
})
