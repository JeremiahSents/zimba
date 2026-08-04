import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  findMemberInOrganization: vi.fn(),
  countOrganizationOwners: vi.fn(),
  deleteMemberFromOrganization: vi.fn(),
}))

vi.mock("@workspace/db/organizations", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import { removeMemberUseCase } from "../../src/team/remove-member"

const ctx = {
  organizationId: "org-1",
  userId: "user-owner",
  role: "owner" as const,
}

describe("removeMemberUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.findMemberInOrganization.mockResolvedValue({
      id: "member-2",
      userId: "user-2",
      role: "site_manager",
    })
    repo.countOrganizationOwners.mockResolvedValue(2)
    repo.deleteMemberFromOrganization.mockResolvedValue({
      id: "member-2",
      userId: "user-2",
      role: "site_manager",
    })
  })

  it("removes a member through workspace scope", async () => {
    await expect(removeMemberUseCase(ctx, "member-2")).resolves.toMatchObject({
      id: "member-2",
    })

    expect(repo.findMemberInOrganization).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "member-2"
    )
    expect(repo.deleteMemberFromOrganization).toHaveBeenCalledWith(
      expect.anything(),
      "org-1",
      "member-2"
    )
  })

  it("rejects blank member ids", async () => {
    await expect(removeMemberUseCase(ctx, " ")).rejects.toMatchObject({
      code: "VALIDATION_FAILED",
    })
    expect(repo.deleteMemberFromOrganization).not.toHaveBeenCalled()
  })

  it("refuses callers who are not the owner", async () => {
    await expect(
      removeMemberUseCase({ ...ctx, role: "site_manager" }, "member-2")
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(repo.deleteMemberFromOrganization).not.toHaveBeenCalled()
  })

  it("refuses to remove the caller themselves", async () => {
    repo.findMemberInOrganization.mockResolvedValue({
      id: "member-1",
      userId: "user-owner",
      role: "owner",
    })

    await expect(
      removeMemberUseCase(ctx, "member-1")
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(repo.deleteMemberFromOrganization).not.toHaveBeenCalled()
  })

  it("refuses to remove the last remaining owner", async () => {
    repo.findMemberInOrganization.mockResolvedValue({
      id: "member-2",
      userId: "user-2",
      role: "owner",
    })
    repo.countOrganizationOwners.mockResolvedValue(1)

    await expect(removeMemberUseCase(ctx, "member-2")).rejects.toMatchObject({
      code: "CONFLICT",
    })
    expect(repo.deleteMemberFromOrganization).not.toHaveBeenCalled()
  })

  it("removes a second owner when another owner remains", async () => {
    repo.findMemberInOrganization.mockResolvedValue({
      id: "member-2",
      userId: "user-2",
      role: "owner",
    })
    repo.countOrganizationOwners.mockResolvedValue(2)

    await expect(removeMemberUseCase(ctx, "member-2")).resolves.toMatchObject({
      id: "member-2",
    })
  })

  it("rejects a member id from another workspace", async () => {
    repo.findMemberInOrganization.mockResolvedValue(null)

    await expect(removeMemberUseCase(ctx, "member-9")).rejects.toMatchObject({
      code: "NOT_FOUND",
    })
    expect(repo.deleteMemberFromOrganization).not.toHaveBeenCalled()
  })
})
