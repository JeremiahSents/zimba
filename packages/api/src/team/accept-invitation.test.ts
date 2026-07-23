import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  findInvitationByTokenHash: vi.fn(),
  findOrganizationById: vi.fn(),
  claimInvitationAndUpsertMember: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import { acceptInvitationUseCase } from "./accept-invitation"

const invite = {
  id: "invite-1",
  organizationId: "org-1",
  email: "person@example.com",
  role: "member",
  responsibility: null,
  status: "pending",
  expiresAt: new Date(Date.now() + 60_000),
}

describe("acceptInvitationUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.findInvitationByTokenHash.mockResolvedValue([invite])
    repo.findOrganizationById.mockResolvedValue([
      { slug: "acme", status: "active" },
    ])
    repo.claimInvitationAndUpsertMember.mockResolvedValue(true)
  })

  it("accepts a valid invitation and returns its workspace", async () => {
    const result = await acceptInvitationUseCase(
      { userId: "user-1", email: "PERSON@example.com" },
      {
        executor: {} as never,
        transaction: async (callback) => callback({} as never),
      },
      "a".repeat(20)
    )
    expect(result).toEqual({ workspaceSlug: "acme" })
  })

  it.each([
    ["malformed token", "short", "VALIDATION_FAILED"],
    ["wrong email", "a".repeat(20), "FORBIDDEN"],
  ])("rejects %s", async (_label, token, code) => {
    if (code === "FORBIDDEN")
      await expect(
        acceptInvitationUseCase(
          { userId: "user-1", email: "other@example.com" },
          { executor: {} as never, transaction: vi.fn() },
          token
        )
      ).rejects.toMatchObject({ code })
    else
      await expect(
        acceptInvitationUseCase(
          { userId: "user-1", email: "person@example.com" },
          { executor: {} as never, transaction: vi.fn() },
          token
        )
      ).rejects.toMatchObject({ code })
  })

  it("rejects inactive, used, expired, and concurrently claimed invitations", async () => {
    repo.findOrganizationById.mockResolvedValue([
      { slug: "acme", status: "inactive" },
    ])
    await expect(
      acceptInvitationUseCase(
        { userId: "u", email: invite.email },
        { executor: {} as never, transaction: vi.fn() },
        "a".repeat(20)
      )
    ).rejects.toMatchObject({ code: "NOT_FOUND" })

    repo.findOrganizationById.mockResolvedValue([
      { slug: "acme", status: "active" },
    ])
    repo.findInvitationByTokenHash.mockResolvedValue([
      { ...invite, status: "accepted" },
    ])
    await expect(
      acceptInvitationUseCase(
        { userId: "u", email: invite.email },
        { executor: {} as never, transaction: vi.fn() },
        "a".repeat(20)
      )
    ).rejects.toMatchObject({ code: "CONFLICT" })

    repo.findInvitationByTokenHash.mockResolvedValue([
      { ...invite, status: "pending", expiresAt: new Date(Date.now() - 1) },
    ])
    await expect(
      acceptInvitationUseCase(
        { userId: "u", email: invite.email },
        { executor: {} as never, transaction: vi.fn() },
        "a".repeat(20)
      )
    ).rejects.toMatchObject({ code: "NOT_FOUND" })

    repo.findInvitationByTokenHash.mockResolvedValue([invite])
    const transaction = vi.fn(async (callback) => callback({} as never))
    repo.claimInvitationAndUpsertMember.mockResolvedValue(false)
    await expect(
      acceptInvitationUseCase(
        { userId: "u", email: invite.email },
        { executor: {} as never, transaction },
        "a".repeat(20)
      )
    ).rejects.toMatchObject({ code: "CONFLICT" })
  })
})
