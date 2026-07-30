import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  createOrganization: vi.fn(),
  createOrganizationMember: vi.fn(),
  findActiveUserMemberships: vi.fn(),
  isSlugAvailable: vi.fn(),
  userOwnsAnyOrganization: vi.fn(),
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

import { createWorkspaceUseCase } from "../../src/organizations/create-workspace"

const ctx = { userId: "user-1" }

function asOwner(count = 1) {
  repo.userOwnsAnyOrganization.mockResolvedValue(true)
  repo.findActiveUserMemberships.mockResolvedValue(
    Array.from({ length: count }, (_, index) => ({
      organizationId: `org-${index}`,
      role: "owner",
    }))
  )
}

describe("createWorkspaceUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    repo.isSlugAvailable.mockResolvedValue(true)
  })

  it("creates the workspace and makes the caller its owner", async () => {
    asOwner()

    const result = await createWorkspaceUseCase(ctx, {
      name: "Kampala Heights",
    })

    expect(result.slug).toBe("kampala-heights")
    expect(result.name).toBe("Kampala Heights")
    expect(repo.createOrganization).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        name: "Kampala Heights",
        slug: "kampala-heights",
      })
    )
    expect(repo.createOrganizationMember).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ userId: "user-1", role: "owner" })
    )
  })

  it("refuses a caller who owns no workspace", async () => {
    // A site manager or viewer has never been through the approval queue, so
    // instant creation would let them mint an unreviewed organization.
    repo.userOwnsAnyOrganization.mockResolvedValue(false)

    await expect(
      createWorkspaceUseCase(ctx, { name: "Sneaky Ltd" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(repo.createOrganization).not.toHaveBeenCalled()
  })

  it("suffixes the slug when the normalized name is taken", async () => {
    asOwner()
    repo.isSlugAvailable.mockImplementation(
      async (_tx: unknown, slug: string) => slug !== "kampala-heights"
    )

    const result = await createWorkspaceUseCase(ctx, {
      name: "Kampala Heights",
    })

    expect(result.slug).toBe("kampala-heights-2")
  })

  it("skips reserved slugs rather than creating an unreachable workspace", async () => {
    asOwner()

    // "settings" is a real route; an organization holding that slug could
    // never be browsed to.
    const result = await createWorkspaceUseCase(ctx, { name: "Settings" })

    expect(result.slug).toBe("settings-2")
  })

  it("rejects a name that is too short", async () => {
    asOwner()

    await expect(
      createWorkspaceUseCase(ctx, { name: "x" })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(repo.createOrganization).not.toHaveBeenCalled()
  })

  it("stops an owner at the per-account cap", async () => {
    asOwner(10)

    await expect(
      createWorkspaceUseCase(ctx, { name: "Eleventh Ltd" })
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" })
    expect(repo.createOrganization).not.toHaveBeenCalled()
  })
})
