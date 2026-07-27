import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  deleteInvitationForOrganization: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import { deleteInvitationUseCase } from "./delete-invitation"

const ctx = { organizationId: "org-1" }

describe("deleteInvitationUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.deleteInvitationForOrganization.mockResolvedValue([{ id: "invite-1" }])
  })

  it("deletes invitations through workspace scope", async () => {
    await expect(deleteInvitationUseCase(ctx, "invite-1")).resolves.toEqual({
      id: "invite-1",
    })

    expect(repo.deleteInvitationForOrganization).toHaveBeenCalledWith(
      dbMock,
      "org-1",
      "invite-1"
    )
  })

  it("returns null when no invitation is deleted", async () => {
    repo.deleteInvitationForOrganization.mockResolvedValue([])

    await expect(deleteInvitationUseCase(ctx, "missing")).resolves.toBeNull()
  })

  it("rejects blank invitation ids", async () => {
    await expect(deleteInvitationUseCase(ctx, " ")).rejects.toMatchObject({
      code: "VALIDATION_FAILED",
    })
    expect(repo.deleteInvitationForOrganization).not.toHaveBeenCalled()
  })
})
