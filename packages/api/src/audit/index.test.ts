import type { DatabaseExecutor } from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  appendAuditEvent: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import { recordAuditUseCase } from "./index"

const deps = { executor: {} as DatabaseExecutor }
const ctx = { organizationId: "org-1", userId: "user-1" }

describe("recordAuditUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("records audit events for the current workspace and actor", async () => {
    await recordAuditUseCase(ctx, deps, {
      action: "project.update",
      entityType: "project",
      entityId: "project-1",
      changes: { name: "Villa" },
    })

    expect(repo.appendAuditEvent).toHaveBeenCalledWith(deps.executor, {
      organizationId: "org-1",
      actorId: "user-1",
      action: "project.update",
      entityType: "project",
      entityId: "project-1",
      changes: { name: "Villa" },
    })
  })

  it("rejects malformed audit input", () => {
    expect(() =>
      recordAuditUseCase(ctx, deps, {
        action: "",
        entityType: "",
        entityId: "",
      })
    ).toThrow()
    expect(repo.appendAuditEvent).not.toHaveBeenCalled()
  })
})
