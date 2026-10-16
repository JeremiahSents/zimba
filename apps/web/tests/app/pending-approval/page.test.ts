import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  membership: vi.fn(),
  application: vi.fn(),
}))

vi.mock("@/core/auth/auth", () => ({
  auth: { api: { getSession: mocks.session } },
}))
vi.mock("@/core/organizations/service", () => ({
  getOrganizationMembership: mocks.membership,
}))
vi.mock("@/core/organizations/onboarding-application", () => ({
  getOnboardingApplicationForEmail: mocks.application,
}))
vi.mock("@/core/organizations/actions", () => ({
  claimApprovedWorkspaceAction: vi.fn(),
}))
vi.mock("@/components/landing/urls", () => ({
  getBookDemoHref: () => "/book-demo",
}))
vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(url)
  },
}))
vi.mock("next/image", () => ({ default: "img" }))
vi.mock("next/link", () => ({ default: "a" }))
vi.mock("@workspace/ui/components/badge", () => ({ Badge: "span" }))
vi.mock("@workspace/ui/components/button", () => ({ Button: "button" }))
vi.mock("@workspace/ui/components/card", () => ({
  Card: "div",
  CardContent: "div",
  CardDescription: "p",
  CardHeader: "div",
  CardTitle: "h1",
}))

import PendingApprovalPage from "@/app/pending-approval/page"

describe("pending approval redirects", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.session.mockResolvedValue({
      user: { id: "user-1", email: "ada@example.com" },
    })
    mocks.membership.mockResolvedValue(null)
    mocks.application.mockResolvedValue({
      status: "approved",
      organizationId: "org-1",
      email: "ada@example.com",
    })
  })

  it("renders an approved application without membership instead of redirecting to workspace", async () => {
    await expect(
      PendingApprovalPage({ searchParams: Promise.resolve({}) })
    ).resolves.toBeTruthy()
  })

  it("renders the unavailable-access state without another redirect", async () => {
    await expect(
      PendingApprovalPage({
        searchParams: Promise.resolve({ access: "unavailable" }),
      })
    ).resolves.toBeTruthy()
  })

  it("opens a workspace only when membership exists", async () => {
    mocks.membership.mockResolvedValue({ slug: "kampala-builders" })
    await expect(
      PendingApprovalPage({ searchParams: Promise.resolve({}) })
    ).rejects.toThrow("/kampala-builders/home")
  })

  it("sends signed-out visitors to login", async () => {
    mocks.session.mockResolvedValue(null)
    await expect(
      PendingApprovalPage({ searchParams: Promise.resolve({}) })
    ).rejects.toThrow("/login")
  })
})
