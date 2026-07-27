import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  findProjectForOrganization: vi.fn(),
  createPayable: vi.fn(),
}))

vi.mock("@workspace/db/projects", () => repo)
vi.mock("@workspace/db/receipts", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import { createUpcomingPaymentUseCase } from "./create-upcoming-payment"

const context = {
  userId: "user-1",
  organizationId: "org-1",
  role: "owner" as const,
}

describe("createUpcomingPaymentUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.findProjectForOrganization.mockResolvedValue([{ id: "project-1" }])
    repo.createPayable.mockResolvedValue({
      id: "payable-1",
      organizationId: "org-1",
    })
  })

  it("creates a payment for a tenant-scoped project", async () => {
    const result = await createUpcomingPaymentUseCase(context, {
      projectId: "project-1",
      title: "Materials",
      description: "Steel delivery",
      amount: 125.5,
      currency: "UGX",
      dueDate: "2026-08-01",
    })
    expect(result.id).toBe("payable-1")
    expect(repo.createPayable).toHaveBeenCalledWith(
      dbMock,
      expect.objectContaining({
        organizationId: "org-1",
        projectId: "project-1",
        amountCents: 12550,
      })
    )
  })

  it("rejects invalid input", async () => {
    await expect(
      createUpcomingPaymentUseCase(context, {
        projectId: "project-1",
        title: "",
        amount: -1,
        currency: "UGX",
        dueDate: "not-a-date",
      })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
  })

  it("rejects a project outside the workspace", async () => {
    repo.findProjectForOrganization.mockResolvedValue([])
    await expect(
      createUpcomingPaymentUseCase(context, {
        projectId: "other-project",
        title: "Materials",
        amount: 10,
        currency: "UGX",
        dueDate: "2026-08-01",
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
    expect(repo.createPayable).not.toHaveBeenCalled()
  })
})
