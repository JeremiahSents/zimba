import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@workspace/api", () => ({
  getProjectSummaryUseCase: vi.fn(),
  listArchivedProjectSummariesUseCase: vi.fn(),
  listFinancialExpenseRowsUseCase: vi.fn(),
  listProjectAllocationsUseCase: vi.fn(),
  listProjectAttachmentsUseCase: vi.fn(),
  listProjectSummariesUseCase: vi.fn(),
}))

import * as api from "@workspace/api"
import * as authService from "../auth/service"
import { getProjectDetail, getProjectsList } from "./service"

vi.mock("../auth/service")

describe("Projects Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getProjectSummaryUseCase).mockResolvedValue(null)
    vi.mocked(api.listFinancialExpenseRowsUseCase).mockResolvedValue([])
    vi.mocked(api.listProjectSummariesUseCase).mockResolvedValue([])
    vi.mocked(api.listArchivedProjectSummariesUseCase).mockResolvedValue([])
    vi.mocked(api.listProjectAllocationsUseCase).mockResolvedValue([])
    vi.mocked(api.listProjectAttachmentsUseCase).mockResolvedValue([])
    vi.mocked(authService.requireSession).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: "session-1",
        userId: "user-1",
        expiresAt: new Date(),
        ipAddress: null,
        userAgent: null,
        token: "token-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      organization: {
        organizationId: "org-1",
        organizationName: "Test Org",
        slug: "test-org",
        role: "Owner / Admin",
      },
    })
  })

  it("should list projects and map them correctly", async () => {
    vi.mocked(api.listProjectSummariesUseCase).mockResolvedValue([
      {
        id: "1",
        organizationId: "org-1",
        name: "Test Project",
        location: "Test Location",
        buildingType: "residential",
        clientName: "Test Client",
        landSize: "100 sqm",
        plotSize: "50 sqm",
        startDate: new Date("2024-01-01"),
        targetEndDate: new Date("2024-12-31"),
        status: "on_track",
        currency: "UGX",
        createdAt: new Date(),
        updatedAt: new Date(),
        budgetCents: 10000000, // 100k
        spentCents: 5000000, // 50k
        remainingCents: 5000000,
      } as never,
    ])

    const projects = await getProjectsList()

    expect(projects).toHaveLength(1)
    expect(projects[0]).toMatchObject({
      name: "Test Project",
      budget: 100000,
      spent: 50000,
      remaining: 50000,
      pct: 50,
    })
  })

  it("should get project details and tasks", async () => {
    vi.mocked(api.getProjectSummaryUseCase).mockResolvedValue({
      id: "1",
      organizationId: "org-1",
      name: "Test Project",
      location: "Test Location",
      budgetCents: 10000,
      spentCents: 0,
      remainingCents: 10000,
    } as never)

    vi.mocked(api.listProjectAllocationsUseCase).mockResolvedValue([
      {
        id: "10",
        organizationId: "org-1",
        projectId: "1",
        name: "Foundation",
        budgetCents: 5000,
      } as never,
      {
        id: "11",
        organizationId: "org-1",
        projectId: "1",
        name: "Roofing",
        budgetCents: 5000,
      } as never,
    ])

    const detail = await getProjectDetail("1")

    expect(api.listFinancialExpenseRowsUseCase).toHaveBeenCalledWith(
      { organizationId: "org-1" },
      expect.anything(),
      "1"
    )
    expect(detail?.name).toBe("Test Project")
    expect(detail?.tasks).toHaveLength(2)
    expect(detail?.tasks[0]).toMatchObject({ name: "Foundation", budget: 50 })
  })
})
