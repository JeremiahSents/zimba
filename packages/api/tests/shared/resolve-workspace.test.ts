import { beforeEach, describe, expect, it, vi } from "vitest"
import { ApplicationError } from "../../src/shared/application-error"

vi.mock("@workspace/db/organizations", () => ({
  findWorkspaceBySlug: vi.fn(),
  findMembershipByUserAndOrganization: vi.fn(),
}))

vi.mock("@workspace/db/platform", () => ({
  findActiveGrantForUserAndOrg: vi.fn(),
}))

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

const { findWorkspaceBySlug, findMembershipByUserAndOrganization } =
  await import("@workspace/db/organizations")
const { findActiveGrantForUserAndOrg } = await import("@workspace/db/platform")
const { resolveWorkspace } = await import("../../src/shared/resolve-workspace")

describe("resolveWorkspace", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

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
    const ctx = await resolveWorkspace("user-1", "acme-ltd")
    expect(ctx.organizationId).toBe("org-1")
    expect(ctx.organizationName).toBe("Acme Ltd")
    expect(ctx.slug).toBe("acme-ltd")
    expect(ctx.userId).toBe("user-1")
    expect(ctx.role).toBe("owner")
  })

  it("throws not found for missing workspace", async () => {
    vi.mocked(findWorkspaceBySlug).mockResolvedValue(null)
    await expect(resolveWorkspace("user-1", "nonexistent")).rejects.toThrow(
      ApplicationError
    )
  })

  it("throws not found for non-member", async () => {
    vi.mocked(findWorkspaceBySlug).mockResolvedValue({
      id: "org-1",
      name: "Acme Ltd",
      slug: "acme-ltd",
      status: "active",
    })
    vi.mocked(findMembershipByUserAndOrganization).mockResolvedValue(null)
    vi.mocked(findActiveGrantForUserAndOrg).mockResolvedValueOnce([])
    await expect(resolveWorkspace("user-1", "acme-ltd")).rejects.toThrow(
      ApplicationError
    )
  })

  it("rejects an unknown membership role", async () => {
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
    await expect(resolveWorkspace("user-1", "acme-ltd")).rejects.toThrow(
      ApplicationError
    )
  })

  it("rejects an inactive workspace", async () => {
    vi.mocked(findWorkspaceBySlug).mockResolvedValue({
      id: "org-1",
      name: "Acme Ltd",
      slug: "acme-ltd",
      status: "suspended",
    })
    await expect(resolveWorkspace("user-1", "acme-ltd")).rejects.toThrow(
      ApplicationError
    )
  })

  it("resolves workspace via grant when no member row exists", async () => {
    vi.mocked(findWorkspaceBySlug).mockResolvedValue({
      id: "org-1",
      name: "Acme Ltd",
      slug: "acme-ltd",
      status: "active",
    })
    vi.mocked(findMembershipByUserAndOrganization).mockResolvedValue(null)
    // The query returns rows, and resolveWorkspace destructures the first one.
    vi.mocked(findActiveGrantForUserAndOrg).mockResolvedValueOnce([
      {
        id: "grant-1",
        userId: "user-1",
        organizationId: "org-1",
        organizationName: "Acme Ltd",
        slug: "acme-ltd",
        role: "owner",
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
      },
    ])
    const ctx = await resolveWorkspace("user-1", "acme-ltd")
    expect(ctx.organizationId).toBe("org-1")
    expect(ctx.role).toBe("owner")
    // Marks the context as staff access so tenant audit rows can say so.
    expect(ctx.viaGrantId).toBe("grant-1")
  })

  it("only ever asks for a grant scoped to the workspace being opened", async () => {
    vi.mocked(findWorkspaceBySlug).mockResolvedValue({
      id: "org-1",
      name: "Acme Ltd",
      slug: "acme-ltd",
      status: "active",
    })
    vi.mocked(findMembershipByUserAndOrganization).mockResolvedValue(null)
    vi.mocked(findActiveGrantForUserAndOrg).mockResolvedValueOnce([])

    await expect(resolveWorkspace("user-1", "acme-ltd")).rejects.toThrow(
      ApplicationError
    )
    expect(findActiveGrantForUserAndOrg).toHaveBeenCalledWith(
      dbMock,
      "user-1",
      "org-1"
    )
  })
})
