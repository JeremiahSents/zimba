import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  createAllocation: vi.fn(),
  createProject: vi.fn(),
  createProjectAttachment: vi.fn(),
  findFileForOrganization: vi.fn(),
}))

vi.mock("@workspace/db/files", () => repo)
vi.mock("@workspace/db/projects", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import { createProjectWithAllocationsUseCase } from "../../src/projects/create-project"

const context = {
  userId: "user-1",
  organizationId: "org-1",
  role: "owner" as const,
}

describe("createProjectWithAllocationsUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    dbMock.transaction.mockImplementation(
      async <Result>(
        callback: (tx: never) => Promise<Result>
      ): Promise<Result> => callback({} as never)
    )
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
    const result = await createProjectWithAllocationsUseCase(context, {
      organizationId: "org-1",
      name: "House",
      location: "Kampala",
      currency: "UGX",
      landSize: "100 sqm",
      buildingType: "residential",
      allocations: [{ name: "Foundation", budget: 1000 }],
    })
    expect(result.id).toBe("project-1")
    expect(dbMock.transaction).toHaveBeenCalledOnce()
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
      createProjectWithAllocationsUseCase(context, {
        organizationId: "org-1",
        name: "House",
        location: "Kampala",
        currency: "UGX",
        landSize: "100 sqm",
        buildingType: "residential",
        allocations: [{ name: "Foundation", budget: 1000 }],
        attachmentIds: ["other-file"],
      })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(repo.createProjectAttachment).not.toHaveBeenCalled()
  })
})
