import type { DatabaseExecutor } from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  listPlatformPayments: vi.fn(),
  listPlatformProjects: vi.fn(),
  listPlatformReceipts: vi.fn(),
  listPlatformSuppliers: vi.fn(),
  readPlatformStats: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import {
  getPlatformStatsUseCase,
  listPlatformPaymentsUseCase,
  listPlatformProjectsUseCase,
  listPlatformReceiptsUseCase,
  listPlatformSuppliersUseCase,
} from "./platform"

const deps = { executor: {} as DatabaseExecutor }

describe("admin platform read use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("adds organizations needing attention to platform stats", async () => {
    repo.readPlatformStats.mockResolvedValue({
      suspendedOrganizations: 2,
      trialOrganizations: 3,
    })

    await expect(getPlatformStatsUseCase(deps)).resolves.toMatchObject({
      organizationsNeedingAttention: 5,
    })
  })

  it("normalizes optional receipt and payment labels", async () => {
    repo.listPlatformReceipts.mockResolvedValue([
      { id: "receipt-1", projectName: null, supplierName: null },
    ])
    repo.listPlatformPayments.mockResolvedValue([
      { id: "payment-1", supplierName: null },
    ])

    await expect(listPlatformReceiptsUseCase(deps)).resolves.toEqual([
      expect.objectContaining({ projectName: "None", supplierName: "None" }),
    ])
    await expect(listPlatformPaymentsUseCase(deps)).resolves.toEqual([
      expect.objectContaining({ supplierName: "None" }),
    ])
  })

  it("delegates supplier and project lists", async () => {
    repo.listPlatformSuppliers.mockReturnValue("suppliers")
    repo.listPlatformProjects.mockReturnValue("projects")

    expect(listPlatformSuppliersUseCase(deps)).toBe("suppliers")
    expect(listPlatformProjectsUseCase(deps)).toBe("projects")
  })
})
