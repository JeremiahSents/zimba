import type { DatabaseExecutor } from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  findInvitationPreviewByTokenHash: vi.fn(),
  listPendingInvitations: vi.fn(),
  listTeamMembers: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import { getInvitationPreviewUseCase, listTeamUseCase } from "./read-team"

const deps = { executor: {} as DatabaseExecutor }

describe("team read use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.listTeamMembers.mockResolvedValue([{ id: "member-1" }])
    repo.listPendingInvitations.mockResolvedValue([{ id: "invite-1" }])
  })

  it("lists members and pending invitations for the workspace", async () => {
    await expect(
      listTeamUseCase({ organizationId: "org-1" }, deps)
    ).resolves.toEqual({
      members: [{ id: "member-1" }],
      invitations: [{ id: "invite-1" }],
    })

    expect(repo.listTeamMembers).toHaveBeenCalledWith(deps.executor, "org-1")
    expect(repo.listPendingInvitations).toHaveBeenCalledWith(
      deps.executor,
      "org-1"
    )
  })

  it("returns invalid for an unknown invitation preview token", async () => {
    repo.findInvitationPreviewByTokenHash.mockResolvedValue([])

    await expect(
      getInvitationPreviewUseCase(deps, "a".repeat(20))
    ).resolves.toEqual({ state: "invalid" })
  })

  it("maps accepted invitations to used previews", async () => {
    const expiresAt = new Date(Date.now() + 60_000)
    repo.findInvitationPreviewByTokenHash.mockResolvedValue([
      {
        organizationName: "Zimba",
        email: "person@example.com",
        status: "accepted",
        expiresAt,
      },
    ])

    await expect(
      getInvitationPreviewUseCase(deps, "a".repeat(20))
    ).resolves.toMatchObject({ state: "used", expiresAt })
  })

  it("maps expired invitations to expired previews", async () => {
    repo.findInvitationPreviewByTokenHash.mockResolvedValue([
      {
        organizationName: "Zimba",
        email: "person@example.com",
        status: "pending",
        expiresAt: new Date(Date.now() - 60_000),
      },
    ])

    await expect(
      getInvitationPreviewUseCase(deps, "a".repeat(20))
    ).resolves.toMatchObject({ state: "expired" })
  })

  it("rejects malformed preview tokens", async () => {
    await expect(
      getInvitationPreviewUseCase(deps, "short")
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(repo.findInvitationPreviewByTokenHash).not.toHaveBeenCalled()
  })
})
