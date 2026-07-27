import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  findUserOrganizationMembership: vi.fn(),
  findUserOrganizationMembershipBySlug: vi.fn(),
}))
vi.mock("@workspace/db/repositories", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(callback: (tx: unknown) => Promise<Result>): Promise<Result> =>
      callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import { getOrganizationMembershipUseCase } from "./get-membership"

describe("getOrganizationMembershipUseCase", () => {
  beforeEach(() => vi.resetAllMocks())

  it("resolves the requested workspace slug", async () => {
    repo.findUserOrganizationMembershipBySlug.mockResolvedValue([
      { organizationId: "org-1", slug: "zimba" },
    ])
    const result = await getOrganizationMembershipUseCase(
      "user-1",
      "zimba"
    )
    expect(result?.organizationId).toBe("org-1")
    expect(repo.findUserOrganizationMembershipBySlug).toHaveBeenCalledWith(
      dbMock,
      "user-1",
      "zimba"
    )
  })

  it("returns null when there is no membership", async () => {
    repo.findUserOrganizationMembership.mockResolvedValue([])
    await expect(
      getOrganizationMembershipUseCase("user-1")
    ).resolves.toBeNull()
  })
})
