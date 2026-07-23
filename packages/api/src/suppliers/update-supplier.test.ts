import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({ updateSupplierForOrganization: vi.fn() }))
vi.mock("@workspace/db/repositories", () => repo)

import { updateSupplierUseCase } from "./index"

const context = {
  userId: "user-1",
  organizationId: "org-1",
  role: "accountant" as const,
}

describe("updateSupplierUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.updateSupplierForOrganization.mockResolvedValue({
      id: "supplier-1",
      organizationId: "org-1",
      name: "Acme",
      category: "materials",
      email: null,
      status: "active",
    })
  })

  it("updates a tenant-scoped supplier", async () => {
    const result = await updateSupplierUseCase(
      context,
      { executor: {} as never },
      "supplier-1",
      { name: "Acme", category: "materials" }
    )
    expect(result.id).toBe("supplier-1")
    expect(repo.updateSupplierForOrganization).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "supplier-1",
      expect.objectContaining({ name: "Acme" })
    )
  })

  it("returns not found without leaking another tenant", async () => {
    repo.updateSupplierForOrganization.mockResolvedValue(undefined)
    await expect(
      updateSupplierUseCase(context, { executor: {} as never }, "other", {
        name: "Acme",
        category: "materials",
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
  })
})
