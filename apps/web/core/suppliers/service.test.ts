import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@workspace/api", () => ({
  createSupplierUseCase: vi.fn(),
  createSupplierCategoryUseCase: vi.fn(),
}))

import * as api from "@workspace/api"
import * as authService from "../auth/service"
import * as supplierRepo from "./repository"
import {
  createSupplier,
  createSupplierCategory,
  getSuppliersList,
} from "./service"

vi.mock("./repository")
vi.mock("../auth/service")

describe("Suppliers Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(supplierRepo.listSupplierSummaries).mockResolvedValue([])
    vi.mocked(api.createSupplierUseCase).mockResolvedValue({
      id: "sup-2",
      organizationId: "org-1",
      name: "New Supplier",
      category: "labour",
      email: "",
      status: "active",
    })
    vi.mocked(api.createSupplierCategoryUseCase).mockResolvedValue({
      id: "category-1",
      organizationId: "org-1",
      name: "Heavy Transport",
      slug: "heavy-transport",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
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

  it("should list suppliers", async () => {
    vi.mocked(supplierRepo.listSupplierSummaries).mockResolvedValue([
      {
        id: "sup-1",
        organizationId: "org-1",
        name: "Test Supplier",
        category: "materials",
        phone: "123456",
        email: "sup@example.com",
        notes: null,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        receiptCount: 1,
        incurredCents: 10000,
        paidCents: 5000,
      } as never,
    ])

    const suppliers = await getSuppliersList()

    expect(suppliers).toHaveLength(1)
    expect(suppliers[0]).toMatchObject({
      name: "Test Supplier",
      category: "materials",
      phone: "123456",
      status: "active",
    })
  })

  it("should create supplier", async () => {
    const created = await createSupplier({
      name: "New Supplier",
      category: "labour",
    })

    expect(created?.id).toBe("sup-2")
    expect(vi.mocked(api.createSupplierUseCase).mock.calls[0]?.[2]).toEqual(
      expect.objectContaining({
        organizationId: "org-1",
        name: "New Supplier",
        category: "labour",
      })
    )
  })

  it("creates a normalized category inside the active organization", async () => {
    await createSupplierCategory("  Heavy   Transport ")
    expect(api.createSupplierCategoryUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org-1" }),
      expect.anything(),
      "  Heavy   Transport "
    )
  })
})
