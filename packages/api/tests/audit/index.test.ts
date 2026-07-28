import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  appendAuditEvent: vi.fn(),
}))

vi.mock("@workspace/db/audit", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import { recordAuditUseCase } from "../../src/audit/index"

const ctx = { organizationId: "org-1", userId: "user-1" }

describe("recordAuditUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("records audit events for the current workspace and actor", async () => {
    await recordAuditUseCase(ctx, {
      action: "project.update",
      entityType: "project",
      entityId: "project-1",
      changes: { name: "Villa" },
    })

    expect(repo.appendAuditEvent).toHaveBeenCalledWith(dbMock, {
      organizationId: "org-1",
      actorId: "user-1",
      action: "project.update",
      entityType: "project",
      entityId: "project-1",
      changes: { name: "Villa" },
      viaGrantId: null,
    })
  })

  it("stamps the grant id when platform staff act on a tenant", async () => {
    await recordAuditUseCase(
      { ...ctx, viaGrantId: "grant-1" },
      {
        action: "project.update",
        entityType: "project",
        entityId: "project-1",
      }
    )

    // Without this the customer cannot tell a staff action from their own.
    expect(repo.appendAuditEvent).toHaveBeenCalledWith(
      dbMock,
      expect.objectContaining({ actorId: "user-1", viaGrantId: "grant-1" })
    )
  })

  it("rejects malformed audit input", () => {
    expect(() =>
      recordAuditUseCase(ctx, {
        action: "",
        entityType: "",
        entityId: "",
      })
    ).toThrow()
    expect(repo.appendAuditEvent).not.toHaveBeenCalled()
  })
})
