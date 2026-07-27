import { beforeEach, describe, expect, it, vi } from "vitest"

const repo = vi.hoisted(() => ({
  listPlatformAuditEvents: vi.fn(),
  listRecentActivityEvents: vi.fn(),
}))

vi.mock("@workspace/db/repositories", () => repo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(callback: (tx: unknown) => Promise<Result>): Promise<Result> =>
      callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import {
  listPlatformActivityEventsUseCase,
  listPlatformAuditLogsUseCase,
  listRecentActivityUseCase,
} from "./audit"

describe("admin audit read use cases", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("normalizes missing audit actors", async () => {
    repo.listPlatformAuditEvents.mockResolvedValue([
      { id: "audit-1", actorName: null },
    ])

    await expect(listPlatformAuditLogsUseCase()).resolves.toEqual([
      expect.objectContaining({ actorName: "Unknown" }),
    ])
  })

  it("normalizes missing activity actors and forwards the limit", async () => {
    repo.listRecentActivityEvents.mockResolvedValue([
      { id: "activity-1", actorName: null },
    ])

    await expect(listRecentActivityUseCase(7)).resolves.toEqual([
      expect.objectContaining({ actorName: "System" }),
    ])
    expect(repo.listRecentActivityEvents).toHaveBeenCalledWith(dbMock, 7)
  })

  it("uses a larger limit for platform activity", async () => {
    repo.listRecentActivityEvents.mockResolvedValue([])

    await listPlatformActivityEventsUseCase()

    expect(repo.listRecentActivityEvents).toHaveBeenCalledWith(
      dbMock,
      100
    )
  })
})
