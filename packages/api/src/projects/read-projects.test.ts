import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  findActiveProjectForOrganization: vi.fn(),
  findExpenseForOrganization: vi.fn(),
  findPayableForOrganization: vi.fn(),
  listAllocationsForProject: vi.fn(),
  listArchivedProjectsForOrganization: vi.fn(),
  listExpensesForOrganization: vi.fn(),
  listPayablesForOrganization: vi.fn(),
  listPayablePaymentsForPayables: vi.fn(),
  listProjectsForOrganization: vi.fn(),
  listReceiptLinesWithAllocationForExpenses: vi.fn(),
  listReceiptPaymentsForExpenses: vi.fn(),
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
  getProjectSummaryUseCase,
  listArchivedProjectSummariesUseCase,
  listProjectSummariesUseCase,
} from "./read-projects"

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
    repo.listPayablePaymentsForPayables.mockResolvedValue([])
    repo.listReceiptLinesWithAllocationForExpenses.mockResolvedValue([])
    repo.listReceiptPaymentsForExpenses.mockResolvedValue([])
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
    repo.listReceiptLinesWithAllocationForExpenses.mockResolvedValue([
      {
        line: {
          id: "line-1",
          expenseId: "receipt-1",
          allocationId: "allocation-1",
          itemDescription: "Cement",
          amountCents: 250,
        },
        allocationName: "Foundation",
      },
    ])

    await expect(listProjectSummariesUseCase(ctx)).resolves.toEqual([
      expect.objectContaining({
        id: "project-1",
        budgetCents: 1000,
        spentCents: 250,
        remainingCents: 750,
      }),
    ])
  })

  it("lists archived project summaries through the archived repository query", async () => {
    await listArchivedProjectSummariesUseCase(ctx)

    expect(repo.listArchivedProjectsForOrganization).toHaveBeenCalledWith(
      dbMock,
      "org-1"
    )
  })

  it("returns null for an unknown active project", async () => {
    repo.findActiveProjectForOrganization.mockResolvedValue([])

    await expect(
      getProjectSummaryUseCase(ctx, "missing")
    ).resolves.toBeNull()
  })
})
