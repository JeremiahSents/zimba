import type { DatabaseExecutor } from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  findActiveProjectForOrganization: vi.fn(),
  findExpenseForOrganization: vi.fn(),
  findPayableForOrganization: vi.fn(),
  listAllocationsForProject: vi.fn(),
  listArchivedProjectsForOrganization: vi.fn(),
  listExpensesForOrganization: vi.fn(),
  listPayablesForOrganization: vi.fn(),
  listProjectsForOrganization: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import {
  getProjectSummaryUseCase,
  listArchivedProjectSummariesUseCase,
  listProjectSummariesUseCase,
} from "./read-projects"

const deps = { executor: {} as DatabaseExecutor }
const ctx = { organizationId: "org-1" }
const project = {
  id: "project-1",
  organizationId: "org-1",
  name: "Villa",
  location: "Kampala",
  status: "active",
  currency: "UGX",
}

describe("project read use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.listProjectsForOrganization.mockResolvedValue([project])
    repo.listArchivedProjectsForOrganization.mockResolvedValue([project])
    repo.findActiveProjectForOrganization.mockResolvedValue([project])
    repo.listAllocationsForProject.mockResolvedValue([
      { id: "allocation-1", budgetCents: 700 },
      { id: "allocation-2", budgetCents: 300 },
    ])
    repo.listExpensesForOrganization.mockResolvedValue([])
    repo.listPayablesForOrganization.mockResolvedValue([])
  })

  it("lists active project summaries with computed financial totals", async () => {
    repo.listExpensesForOrganization.mockResolvedValue([
      {
        expense: {
          id: "receipt-1",
          organizationId: "org-1",
          projectId: "project-1",
          supplierId: null,
          createdAt: new Date(),
          expenseDate: null,
          paymentStatus: "unpaid",
        },
        projectName: "Villa",
        supplierName: null,
      },
    ])
    repo.findExpenseForOrganization.mockResolvedValue({
      lines: [
        {
          line: {
            id: "line-1",
            allocationId: "allocation-1",
            itemDescription: "Cement",
            amountCents: 250,
          },
          allocationName: "Foundation",
        },
      ],
      payments: [],
    })

    await expect(listProjectSummariesUseCase(ctx, deps)).resolves.toEqual([
      expect.objectContaining({
        id: "project-1",
        budgetCents: 1000,
        spentCents: 250,
        remainingCents: 750,
      }),
    ])
  })

  it("lists archived project summaries through the archived repository query", async () => {
    await listArchivedProjectSummariesUseCase(ctx, deps)

    expect(repo.listArchivedProjectsForOrganization).toHaveBeenCalledWith(
      deps.executor,
      "org-1"
    )
  })

  it("returns null for an unknown active project", async () => {
    repo.findActiveProjectForOrganization.mockResolvedValue([])

    await expect(
      getProjectSummaryUseCase(ctx, deps, "missing")
    ).resolves.toBeNull()
  })
})
