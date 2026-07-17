import { describe, it, expect, vi, beforeEach } from "vitest"
vi.mock("server-only", () => ({}))
vi.mock("@/lib/auth", () => ({}))
vi.mock("@/lib/organization", () => ({}))
import { getSuppliersList, createSupplier } from "./service"
import * as supplierRepo from "./repository"
import * as authService from "../auth/service"

vi.mock("./repository")
vi.mock("../auth/service")

describe("Suppliers Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(authService.requireSession).mockResolvedValue({
      user: { id: "user-1", name: "Test User", email: "test@example.com", emailVerified: true, createdAt: new Date(), updatedAt: new Date() },
      session: { id: "session-1", userId: "user-1", expiresAt: new Date(), ipAddress: null, userAgent: null, token: "token-1", createdAt: new Date(), updatedAt: new Date() },
      organization: { organizationId: "org-1", organizationName: "Test Org", role: "Owner / Admin" },
    })
  })

  it("should list suppliers", async () => {
    vi.mocked(supplierRepo.listSuppliers).mockResolvedValue([
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
      } as any,
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
    vi.mocked(supplierRepo.createSupplier).mockResolvedValue({
      id: "sup-2",
      name: "New Supplier",
    } as any)

    const created = await createSupplier({
      name: "New Supplier",
      category: "labour",
    })

    expect(created.id).toBe("sup-2")
    expect(supplierRepo.createSupplier).toHaveBeenCalledWith(expect.objectContaining({
      name: "New Supplier",
      category: "labour",
      organizationId: "org-1",
    }))
  })
})
