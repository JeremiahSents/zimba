import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  claim: vi.fn(),
  membership: vi.fn(),
}))

vi.mock("@/core/auth/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}))
vi.mock("@workspace/api", () => ({
  claimApprovedApplicationUseCase: mocks.claim,
}))
vi.mock("@/core/organizations/service", () => ({
  getOrganizationMembership: mocks.membership,
}))
vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(url)
  },
}))

import { claimApprovedWorkspaceAction } from "@/core/organizations/actions"

describe("claimApprovedWorkspaceAction", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.getSession.mockResolvedValue({
      user: { id: "user-1", email: "ada@example.com" },
    })
    mocks.claim.mockResolvedValue(null)
    mocks.membership.mockResolvedValue(null)
  })

  it("requires a session before claiming access", async () => {
    mocks.getSession.mockResolvedValue(null)
    await expect(claimApprovedWorkspaceAction()).rejects.toThrow("/login")
    expect(mocks.claim).not.toHaveBeenCalled()
  })

  it("uses the signed-in identity and opens a confirmed workspace", async () => {
    mocks.membership.mockResolvedValue({ slug: "kampala-builders" })
    await expect(claimApprovedWorkspaceAction()).rejects.toThrow(
      "/kampala-builders/home"
    )
    expect(mocks.claim).toHaveBeenCalledWith({
      userId: "user-1",
      email: "ada@example.com",
    })
  })

  it("returns to an explanatory approval state when no membership is available", async () => {
    await expect(claimApprovedWorkspaceAction()).rejects.toThrow(
      "/pending-approval?access=unavailable"
    )
  })

  it("does not swallow claim failures as redirects", async () => {
    mocks.claim.mockRejectedValue(new Error("Database unavailable"))
    await expect(claimApprovedWorkspaceAction()).rejects.toThrow(
      "Database unavailable"
    )
    expect(mocks.membership).not.toHaveBeenCalled()
  })
})
