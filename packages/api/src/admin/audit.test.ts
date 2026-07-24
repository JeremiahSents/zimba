import type { DatabaseExecutor } from "@workspace/db/repositories"
import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  listPlatformAuditEvents: vi.fn(),
  listRecentActivityEvents: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

import {
  listPlatformActivityEventsUseCase,
  listPlatformAuditLogsUseCase,
  listRecentActivityUseCase,
} from "./audit"

const deps = { executor: {} as DatabaseExecutor }

describe("admin audit read use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("normalizes missing audit actors", async () => {
    repo.listPlatformAuditEvents.mockResolvedValue([
      { id: "audit-1", actorName: null },
    ])

    await expect(listPlatformAuditLogsUseCase(deps)).resolves.toEqual([
      expect.objectContaining({ actorName: "Unknown" }),
    ])
  })

  it("normalizes missing activity actors and forwards the limit", async () => {
    repo.listRecentActivityEvents.mockResolvedValue([
      { id: "activity-1", actorName: null },
    ])

    await expect(listRecentActivityUseCase(deps, 7)).resolves.toEqual([
      expect.objectContaining({ actorName: "System" }),
    ])
    expect(repo.listRecentActivityEvents).toHaveBeenCalledWith(deps.executor, 7)
  })

  it("uses a larger limit for platform activity", async () => {
    repo.listRecentActivityEvents.mockResolvedValue([])

    await listPlatformActivityEventsUseCase(deps)

    expect(repo.listRecentActivityEvents).toHaveBeenCalledWith(
      deps.executor,
      100
    )
  })
})
