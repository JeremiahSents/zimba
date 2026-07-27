import type { DatabaseTransaction, TransactionRunner } from "@workspace/db/executor"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  appendAuditEvent: vi.fn(),
  createSupplier: vi.fn(),
  createSupplierCategory: vi.fn(),
  findSupplierByNameForOrganization: vi.fn(),
  findSupplierCategoryBySlug: vi.fn(),
  listSupplierCategories: vi.fn(),
  listSupplierSummaries: vi.fn(),
  updateSupplierForOrganization: vi.fn(),
}))
vi.mock("@workspace/db/audit", () => repo)
vi.mock("@workspace/db/suppliers", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import {
  createSupplierCategoryUseCase,
  createSupplierUseCase,
  listSupplierCategoriesUseCase,
  listSupplierSummariesUseCase,
  updateSupplierUseCase,
} from "./index"

const context = {
  userId: "user-1",
  organizationId: "org-1",
  role: "accountant" as const,
}

const supplier = {
  id: "supplier-1",
  organizationId: "org-1",
  name: "Acme",
  category: "materials",
  email: null,
  status: "active",
}

describe("supplier use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    dbMock.transaction.mockImplementation(
      async <Result>(
        callback: (tx: DatabaseTransaction) => Promise<Result>
      ): Promise<Result> => callback({} as DatabaseTransaction)
    )
    repo.createSupplier.mockResolvedValue(supplier)
    repo.findSupplierByNameForOrganization.mockResolvedValue([])
    repo.findSupplierCategoryBySlug.mockResolvedValue([
      { id: "category-1", slug: "custom-category", organizationId: "org-1" },
    ])
    repo.updateSupplierForOrganization.mockResolvedValue(supplier)
    repo.createSupplierCategory.mockResolvedValue({
      id: "category-1",
      organizationId: "org-1",
      name: "Heavy Transport",
      slug: "heavy-transport",
    })
    repo.listSupplierSummaries.mockResolvedValue([{ id: "supplier-1" }])
    repo.listSupplierCategories.mockResolvedValue([{ slug: "materials" }])
  })

  it("creates a supplier in the trusted workspace", async () => {
    const result = await createSupplierUseCase(context, {
      organizationId: "org-1",
      name: "Acme",
      category: "materials",
    })

    expect(result.id).toBe("supplier-1")
    expect(repo.createSupplier).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ organizationId: "org-1", name: "Acme" })
    )
  })

  it("rejects duplicate suppliers in the workspace", async () => {
    repo.findSupplierByNameForOrganization.mockResolvedValue([supplier])
    await expect(
      createSupplierUseCase(context, {
        organizationId: "org-1",
        name: "Acme",
        category: "materials",
      })
    ).rejects.toMatchObject({ code: "CONFLICT" })
  })

  it("rejects category slugs from another workspace", async () => {
    repo.findSupplierCategoryBySlug.mockResolvedValue([])
    await expect(
      createSupplierUseCase(context, {
        organizationId: "org-1",
        name: "Acme",
        category: "foreign-category",
      })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
  })

  it("updates a tenant-scoped supplier and audits in the transaction", async () => {
    const result = await updateSupplierUseCase(context, "supplier-1", {
      name: "Acme",
      category: "materials",
    })

    expect(result.id).toBe("supplier-1")
    expect(repo.updateSupplierForOrganization).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "supplier-1",
      expect.objectContaining({ name: "Acme" })
    )
    expect(repo.appendAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        organizationId: "org-1",
        actorId: "user-1",
        action: "supplier.update",
      })
    )
  })

  it("returns not found without leaking another tenant", async () => {
    repo.updateSupplierForOrganization.mockResolvedValue(undefined)
    await expect(
      updateSupplierUseCase(context, "other", {
        name: "Acme",
        category: "materials",
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" })
  })

  it("rejects updates from unsupported roles", async () => {
    await expect(
      updateSupplierUseCase({ ...context, role: "viewer" }, "supplier-1", {
        name: "Acme",
        category: "materials",
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(dbMock.transaction).not.toHaveBeenCalled()
  })

  it("creates a supplier category scoped to the workspace", async () => {
    repo.findSupplierCategoryBySlug.mockResolvedValue([])
    const category = await createSupplierCategoryUseCase(
      context,
      " Heavy   Transport "
    )

    expect(category.slug).toBe("heavy-transport")
    expect(repo.createSupplierCategory).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        organizationId: "org-1",
        name: "Heavy Transport",
        slug: "heavy-transport",
      })
    )
  })

  it("lists supplier summaries and categories for the trusted workspace", async () => {
    await listSupplierSummariesUseCase(context)
    await listSupplierCategoriesUseCase(context)

    expect(repo.listSupplierSummaries).toHaveBeenCalledWith(
      expect.anything(),
      "org-1"
    )
    expect(repo.listSupplierCategories).toHaveBeenCalledWith(
      expect.anything(),
      "org-1"
    )
  })
})
