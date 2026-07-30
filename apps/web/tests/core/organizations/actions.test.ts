import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const api = vi.hoisted(() => ({
  listSuperAdminRecipientsUseCase: vi.fn(),
  recordPlatformAuditUseCase: vi.fn(),
  submitOnboardingApplicationUseCase: vi.fn(),
}))

const transactional = vi.hoisted(() => ({
  sendApplicationSubmittedEmail: vi.fn(),
  sendOnboardingRequestEmail: vi.fn(),
}))

const nav = vi.hoisted(() => ({
  redirect: vi.fn((path: string) => {
    throw Object.assign(new Error(`NEXT_REDIRECT:${path}`), { path })
  }),
}))

const authMock = vi.hoisted(() => ({
  auth: { api: { getSession: vi.fn() } },
}))

vi.mock("@workspace/api", () => api)
vi.mock("@workspace/transactional", () => transactional)
vi.mock("next/navigation", () => nav)
vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("@/core/auth/auth", () => authMock)
vi.mock("@/core/organizations/service", () => ({
  getOrganizationMembership: vi.fn(async () => null),
}))

const { completeOnboarding } = await import("@/core/organizations/actions")
const { getOrganizationMembership } = await import(
  "@/core/organizations/service"
)

const application = {
  id: "app-1",
  userId: "user-1",
  fullName: "Ada Nakato",
  email: "ada@example.com",
  companyName: "Kampala Builders",
  companyWebsite: null,
  industry: null,
  country: null,
  phone: null,
  teamSize: null,
  useCase: null,
  status: "pending" as const,
  organizationId: null,
  reviewedBy: null,
  reviewedAt: null,
  rejectionReason: null,
  createdAt: new Date("2026-07-30T09:00:00.000Z"),
  updatedAt: new Date("2026-07-30T09:00:00.000Z"),
}

function formOf(fields: Record<string, string>) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(fields)) formData.set(key, value)
  return formData
}

const validForm = {
  fullName: "Ada Nakato",
  companyName: "Kampala Builders",
  email: "ada@example.com",
}

/**
 * The action redirects rather than returning, and `redirect` throws. Returning
 * a state instead means the submission was rejected, which is a test failure
 * everywhere this helper is used.
 */
async function submit(
  fields: Record<string, string>
): Promise<{ path?: string }> {
  const outcome: unknown = await completeOnboarding({}, formOf(fields)).catch(
    (error: unknown) => error
  )
  if (outcome instanceof Error) return outcome as Error & { path?: string }
  throw new Error(
    `Expected a redirect but the action returned ${JSON.stringify(outcome)}`
  )
}

describe("completeOnboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.auth.api.getSession.mockResolvedValue({
      user: { id: "user-1", email: "session@example.com", name: "Ada" },
    })
    vi.mocked(getOrganizationMembership).mockResolvedValue(null)
    api.submitOnboardingApplicationUseCase.mockResolvedValue(application)
    api.listSuperAdminRecipientsUseCase.mockResolvedValue([
      { id: "sa-1", name: "Root", email: "root@zimba.digital" },
      { id: "sa-2", name: "Ops", email: "ops@zimba.digital" },
    ])
    api.recordPlatformAuditUseCase.mockResolvedValue(undefined)
    transactional.sendApplicationSubmittedEmail.mockResolvedValue({
      id: "e1",
      error: null,
    })
    transactional.sendOnboardingRequestEmail.mockResolvedValue({
      sent: ["root@zimba.digital", "ops@zimba.digital"],
      failed: [],
    })
  })

  it("emails every super admin the submitted details and a review link", async () => {
    await submit(validForm)

    expect(transactional.sendOnboardingRequestEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["root@zimba.digital", "ops@zimba.digital"],
        fullName: "Ada Nakato",
        companyName: "Kampala Builders",
        personalEmail: "ada@example.com",
        reviewUrl: expect.stringContaining("/applications/app-1"),
      })
    )
  })

  it("emails the client a welcome message at the address they typed", async () => {
    await submit(validForm)

    expect(transactional.sendApplicationSubmittedEmail).toHaveBeenCalledWith({
      to: "ada@example.com",
      fullName: "Ada Nakato",
      companyName: "Kampala Builders",
    })
  })

  it("sends the personal email from the form, not the session address", async () => {
    await submit({ ...validForm, email: "personal@example.com" })

    expect(api.submitOnboardingApplicationUseCase).toHaveBeenCalledWith(
      { userId: "user-1" },
      expect.objectContaining({ email: "personal@example.com" })
    )
  })

  it("falls back to the session address when the field is blank", async () => {
    await submit({ ...validForm, email: "" })

    expect(api.submitOnboardingApplicationUseCase).toHaveBeenCalledWith(
      { userId: "user-1" },
      expect.objectContaining({ email: "session@example.com" })
    )
  })

  it("redirects to the pending page once the request is recorded", async () => {
    const result = await submit(validForm)

    expect(result.path).toBe("/pending-approval?submitted=1")
  })

  it("still records the request when the admin notification fails", async () => {
    transactional.sendOnboardingRequestEmail.mockRejectedValue(
      new Error("resend down")
    )

    const result = await submit(validForm)

    expect(result.path).toBe("/pending-approval?submitted=1")
  })

  it("still records the request when there is no super admin to notify", async () => {
    api.listSuperAdminRecipientsUseCase.mockResolvedValue([])

    const result = await submit(validForm)

    expect(transactional.sendOnboardingRequestEmail).not.toHaveBeenCalled()
    expect(result.path).toBe("/pending-approval?submitted=1")
  })

  it("returns field errors and keeps what was typed", async () => {
    api.submitOnboardingApplicationUseCase.mockRejectedValue(
      Object.assign(new Error("Check the highlighted details and try again."), {
        code: "VALIDATION_FAILED",
        fieldErrors: { email: ["Invalid email"] },
      })
    )

    const state = await completeOnboarding(
      {},
      formOf({ ...validForm, email: "nope" })
    )

    expect(state.fieldErrors?.email).toBeTruthy()
    expect(state.values).toMatchObject({
      fullName: "Ada Nakato",
      companyName: "Kampala Builders",
      email: "nope",
    })
    expect(transactional.sendOnboardingRequestEmail).not.toHaveBeenCalled()
  })

  it("surfaces a conflict as a form-level error without emailing anyone", async () => {
    api.submitOnboardingApplicationUseCase.mockRejectedValue(
      Object.assign(new Error("You already have a pending request."), {
        code: "CONFLICT",
      })
    )

    const state = await completeOnboarding({}, formOf(validForm))

    expect(state.error).toMatch(/already have a pending request/i)
    expect(transactional.sendApplicationSubmittedEmail).not.toHaveBeenCalled()
  })

  it("sends an unauthenticated visitor to sign in", async () => {
    authMock.auth.api.getSession.mockResolvedValue(null)

    const result = await submit(validForm)

    expect(result.path).toBe("/login")
    expect(api.submitOnboardingApplicationUseCase).not.toHaveBeenCalled()
  })

  it("sends an existing member straight to their workspace", async () => {
    vi.mocked(getOrganizationMembership).mockResolvedValue({
      organizationId: "org-1",
      organizationName: "Kampala Builders",
      slug: "kampala-builders",
      role: "owner",
    } as never)

    const result = await submit(validForm)

    expect(result.path).toBe("/kampala-builders/home")
    expect(api.submitOnboardingApplicationUseCase).not.toHaveBeenCalled()
  })
})
