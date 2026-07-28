import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  findUserOrganizationMembership: vi.fn(),
  findUserOrganizationMembershipBySlug: vi.fn(),
}))
vi.mock("@workspace/db/organizations", () => repo)

const platformRepo = vi.hoisted(() => ({
  findActiveGrantForUser: vi.fn(),
}))
vi.mock("@workspace/db/platform", () => platformRepo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import { getOrganizationMembershipUseCase } from "../../src/organizations/get-membership"

const grantOnAcme = {
  id: "grant-1",
  userId: "user-1",
  organizationId: "org-2",
  organizationName: "Acme Ltd",
  slug: "acme-ltd",
  role: "owner",
  expiresAt: new Date(Date.now() + 60_000),
  createdAt: new Date(),
}

describe("getOrganizationMembershipUseCase", () => {
  beforeEach(() => vi.resetAllMocks())

  it("resolves the requested workspace slug", async () => {
    repo.findUserOrganizationMembershipBySlug.mockResolvedValue([
      { organizationId: "org-1", slug: "zimba" },
    ])
    const result = await getOrganizationMembershipUseCase("user-1", "zimba")
    expect(result?.organizationId).toBe("org-1")
    expect(repo.findUserOrganizationMembershipBySlug).toHaveBeenCalledWith(
      dbMock,
      "user-1",
      "zimba"
    )
  })

  it("returns null when there is no membership and no grant", async () => {
    repo.findUserOrganizationMembership.mockResolvedValue([])
    platformRepo.findActiveGrantForUser.mockResolvedValue([])
    await expect(getOrganizationMembershipUseCase("user-1")).resolves.toBeNull()
  })

  it("returns grant-backed membership when no member row exists", async () => {
    repo.findUserOrganizationMembership.mockResolvedValue([])
    platformRepo.findActiveGrantForUser.mockResolvedValue([grantOnAcme])

    const result = await getOrganizationMembershipUseCase("user-1")
    expect(result?.organizationId).toBe("org-2")
    expect(result?.organizationName).toBe("Acme Ltd")
    expect(result?.slug).toBe("acme-ltd")
    expect(result?.role).toBe("owner")
    expect(result?.viaGrantId).toBe("grant-1")
  })

  it("honours the grant when the requested slug is the granted one", async () => {
    repo.findUserOrganizationMembershipBySlug.mockResolvedValue([])
    platformRepo.findActiveGrantForUser.mockResolvedValue([grantOnAcme])

    const result = await getOrganizationMembershipUseCase("user-1", "acme-ltd")
    expect(result?.organizationId).toBe("org-2")
    expect(result?.viaGrantId).toBe("grant-1")
  })

  it("refuses to answer for a workspace the grant was not issued against", async () => {
    repo.findUserOrganizationMembershipBySlug.mockResolvedValue([])
    platformRepo.findActiveGrantForUser.mockResolvedValue([grantOnAcme])

    // Otherwise a grant on one tenant resolves while browsing another and
    // writes land in the wrong organization.
    await expect(
      getOrganizationMembershipUseCase("user-1", "some-other-tenant")
    ).resolves.toBeNull()
  })

  it("real membership still wins over a grant", async () => {
    repo.findUserOrganizationMembership.mockResolvedValue([
      { organizationId: "org-1", slug: "zimba", role: "viewer" },
    ])
    platformRepo.findActiveGrantForUser.mockResolvedValue([grantOnAcme])

    const result = await getOrganizationMembershipUseCase("user-1")
    expect(result?.organizationId).toBe("org-1")
    expect(result?.viaGrantId).toBeUndefined()
  })
})
