import { describe, expect, it, vi } from "vitest"
import { ApplicationError } from "../shared/application-error"

vi.mock("@workspace/db/repositories", () => ({
  findWorkspaceBySlug: vi.fn(),
  findMembershipByUserAndOrganization: vi.fn(),
}))

const { findWorkspaceBySlug, findMembershipByUserAndOrganization } =
  await import("@workspace/db/repositories")
const { resolveWorkspace } = await import("./resolve-workspace")

describe("resolveWorkspace", () => {
  it("resolves workspace context for a member", async () => {
    vi.mocked(findWorkspaceBySlug).mockResolvedValue({
      id: "org-1",
      name: "Acme Ltd",
      slug: "acme-ltd",
      status: "active",
    })
    vi.mocked(findMembershipByUserAndOrganization).mockResolvedValue({
      id: "member-1",
      role: "owner",
    })
    const ctx = await resolveWorkspace("user-1", "acme-ltd", {
      executor: {} as never,
    })
    expect(ctx.organizationId).toBe("org-1")
    expect(ctx.organizationName).toBe("Acme Ltd")
    expect(ctx.slug).toBe("acme-ltd")
    expect(ctx.userId).toBe("user-1")
    expect(ctx.role).toBe("owner")
  })

  it("throws not found for missing workspace", async () => {
    vi.mocked(findWorkspaceBySlug).mockResolvedValue(null)
    await expect(
      resolveWorkspace("user-1", "nonexistent", { executor: {} as never })
    ).rejects.toThrow(ApplicationError)
  })

  it("throws not found for non-member", async () => {
    vi.mocked(findWorkspaceBySlug).mockResolvedValue({
      id: "org-1",
      name: "Acme Ltd",
      slug: "acme-ltd",
      status: "active",
    })
    vi.mocked(findMembershipByUserAndOrganization).mockResolvedValue(null)
    await expect(
      resolveWorkspace("user-1", "acme-ltd", { executor: {} as never })
    ).rejects.toThrow(ApplicationError)
  })

  it("normalizes unknown role to viewer", async () => {
    vi.mocked(findWorkspaceBySlug).mockResolvedValue({
      id: "org-1",
      name: "Acme Ltd",
      slug: "acme-ltd",
      status: "active",
    })
    vi.mocked(findMembershipByUserAndOrganization).mockResolvedValue({
      id: "member-1",
      role: "unknown_role",
    })
    const ctx = await resolveWorkspace("user-1", "acme-ltd", {
      executor: {} as never,
    })
    expect(ctx.role).toBe("viewer")
  })
})
