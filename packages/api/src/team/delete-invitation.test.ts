import type { DatabaseExecutor } from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  deleteInvitationForOrganization: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import { deleteInvitationUseCase } from "./delete-invitation"

const deps = { executor: {} as DatabaseExecutor }
const ctx = { organizationId: "org-1" }

describe("deleteInvitationUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.deleteInvitationForOrganization.mockResolvedValue([{ id: "invite-1" }])
  })

  it("deletes invitations through workspace scope", async () => {
    await expect(
      deleteInvitationUseCase(ctx, deps, "invite-1")
    ).resolves.toEqual({ id: "invite-1" })

    expect(repo.deleteInvitationForOrganization).toHaveBeenCalledWith(
      deps.executor,
      "org-1",
      "invite-1"
    )
  })

  it("returns null when no invitation is deleted", async () => {
    repo.deleteInvitationForOrganization.mockResolvedValue([])

    await expect(
      deleteInvitationUseCase(ctx, deps, "missing")
    ).resolves.toBeNull()
  })

  it("rejects blank invitation ids", async () => {
    await expect(deleteInvitationUseCase(ctx, deps, " ")).rejects.toMatchObject(
      { code: "VALIDATION_FAILED" }
    )
    expect(repo.deleteInvitationForOrganization).not.toHaveBeenCalled()
  })
})
