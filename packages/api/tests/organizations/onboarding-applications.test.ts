import { beforeEach, describe, expect, it, vi } from "vitest"

const onboardingRepo = vi.hoisted(() => ({
  countPendingOnboardingApplications: vi.fn(),
  createOnboardingApplication: vi.fn(),
  findOnboardingApplicationById: vi.fn(),
  findPendingOnboardingApplication: vi.fn(),
  findLatestOnboardingApplicationByEmail: vi.fn(),
  findApprovedOnboardingApplicationByEmail: vi.fn(),
  linkOnboardingApplicationUser: vi.fn(),
  listOnboardingApplicationsWithUser: vi.fn(),
  updateOnboardingApplicationStatus: vi.fn(),
}))

const organizationRepo = vi.hoisted(() => ({
  createOrganization: vi.fn(),
  createOrganizationMember: vi.fn(),
  findMembershipByUser: vi.fn(),
  findOrganizationById: vi.fn(),
  findOrganizationBySlug: vi.fn(),
}))

const authRepo = vi.hoisted(() => ({ updateUserName: vi.fn() }))

vi.mock("@workspace/db/onboarding", () => onboardingRepo)
vi.mock("@workspace/db/organizations", () => organizationRepo)
vi.mock("@workspace/db/auth", () => authRepo)

const dbMock = vi.hoisted(() => ({
  transaction: vi.fn(
    async <Result>(
      callback: (tx: unknown) => Promise<Result>
    ): Promise<Result> => callback({})
  ),
}))

vi.mock("@workspace/db", () => ({ db: dbMock }))

import {
  approveOnboardingApplicationUseCase,
  claimApprovedApplicationUseCase,
  rejectOnboardingApplicationUseCase,
  submitOnboardingApplicationUseCase,
} from "../../src/organizations/onboarding-applications"

const ctx = { userId: "user-1" }

const validInput = {
  fullName: "Ada Nakato",
  companyName: "Kampala Builders",
  email: "ada@example.com",
}

function storedRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "app-1",
    userId: ctx.userId,
    fullName: validInput.fullName,
    email: validInput.email,
    companyName: validInput.companyName,
    companyWebsite: null,
    industry: null,
    country: null,
    phone: null,
    teamSize: null,
    useCase: null,
    status: "pending",
    organizationId: null,
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    createdAt: new Date("2026-07-30T09:00:00.000Z"),
    updatedAt: new Date("2026-07-30T09:00:00.000Z"),
    ...overrides,
  }
}

describe("submitting a demo request", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    dbMock.transaction.mockImplementation(async (callback) => callback({}))
    onboardingRepo.findLatestOnboardingApplicationByEmail.mockResolvedValue([])
    onboardingRepo.createOnboardingApplication.mockResolvedValue(storedRow())
  })

  it("stores the three required fields and returns the created request", async () => {
    const result = await submitOnboardingApplicationUseCase(validInput)

    expect(onboardingRepo.createOnboardingApplication).toHaveBeenCalledWith(
      dbMock,
      expect.objectContaining({
        userId: null,
        fullName: "Ada Nakato",
        companyName: "Kampala Builders",
        email: "ada@example.com",
        status: "pending",
      })
    )
    expect(result).toMatchObject({ id: "app-1", status: "pending" })
  })

  it("provisions nothing — approval is what creates the workspace", async () => {
    await submitOnboardingApplicationUseCase(validInput)

    expect(organizationRepo.createOrganization).not.toHaveBeenCalled()
    expect(organizationRepo.createOrganizationMember).not.toHaveBeenCalled()
  })

  it("lower-cases the personal email so notifications reach one address", async () => {
    await submitOnboardingApplicationUseCase({
      ...validInput,
      email: "Ada@Example.COM",
    })

    expect(onboardingRepo.createOnboardingApplication).toHaveBeenCalledWith(
      dbMock,
      expect.objectContaining({ email: "ada@example.com" })
    )
  })

  it("normalizes blank optional fields to null", async () => {
    await submitOnboardingApplicationUseCase({
      ...validInput,
      industry: "",
      country: "",
      useCase: "",
    })

    expect(onboardingRepo.createOnboardingApplication).toHaveBeenCalledWith(
      dbMock,
      expect.objectContaining({ industry: null, country: null, useCase: null })
    )
  })

  it.each([
    ["a missing full name", { ...validInput, fullName: "" }],
    ["a one-character full name", { ...validInput, fullName: "A" }],
    ["a missing company name", { ...validInput, companyName: "" }],
    ["a malformed email", { ...validInput, email: "not-an-email" }],
    ["a missing email", { ...validInput, email: "" }],
  ])("rejects %s", async (_label, input) => {
    await expect(
      submitOnboardingApplicationUseCase(input)
    ).rejects.toThrow()
    expect(onboardingRepo.createOnboardingApplication).not.toHaveBeenCalled()
  })

  it("reports which field failed so the form can mark it", async () => {
    const error = await submitOnboardingApplicationUseCase({
      ...validInput,
      email: "nope",
    }).catch((thrown: unknown) => thrown)

    expect(error).toMatchObject({
      code: "VALIDATION_FAILED",
      fieldErrors: expect.objectContaining({ email: expect.any(Array) }),
    })
  })

  it("refuses a second request while one is still pending", async () => {
    onboardingRepo.findLatestOnboardingApplicationByEmail.mockResolvedValue([
      storedRow(),
    ])

    await expect(
      submitOnboardingApplicationUseCase(validInput)
    ).rejects.toThrow(/already have a pending request/i)
  })

  it("lets a declined applicant request another demo", async () => {
    onboardingRepo.findLatestOnboardingApplicationByEmail.mockResolvedValue([
      storedRow({ status: "rejected" }),
    ])

    await expect(
      submitOnboardingApplicationUseCase(validInput)
    ).resolves.toMatchObject({ id: "app-1" })
  })
})

describe("reviewing a demo request", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    dbMock.transaction.mockImplementation(async (callback) => callback({}))
  })

  it("creates the workspace with the applicant as owner on approval", async () => {
    onboardingRepo.findOnboardingApplicationById.mockResolvedValue([
      storedRow(),
    ])
    organizationRepo.findMembershipByUser.mockResolvedValue([])
    organizationRepo.findOrganizationBySlug.mockResolvedValue([])

    const result = await approveOnboardingApplicationUseCase(
      { reviewerId: "admin-1" },
      "app-1"
    )

    expect(result.slug).toBe("kampala-builders")
    expect(organizationRepo.createOrganizationMember).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ role: "owner", userId: ctx.userId })
    )
    expect(
      onboardingRepo.updateOnboardingApplicationStatus
    ).toHaveBeenCalledWith(
      expect.anything(),
      "app-1",
      expect.objectContaining({ status: "approved", reviewedBy: "admin-1" })
    )
  })

  it("suffixes the slug when the company name is already taken", async () => {
    onboardingRepo.findOnboardingApplicationById.mockResolvedValue([
      storedRow(),
    ])
    organizationRepo.findMembershipByUser.mockResolvedValue([])
    organizationRepo.findOrganizationBySlug.mockResolvedValue([{ id: "org-9" }])

    const result = await approveOnboardingApplicationUseCase(
      { reviewerId: "admin-1" },
      "app-1"
    )

    expect(result.slug).toMatch(/^kampala-builders-[a-f0-9]{6}$/)
  })

  it("records the reason when declining", async () => {
    onboardingRepo.findOnboardingApplicationById.mockResolvedValue([
      storedRow(),
    ])

    await rejectOnboardingApplicationUseCase(
      { reviewerId: "admin-1" },
      "app-1",
      "Need more detail"
    )

    expect(
      onboardingRepo.updateOnboardingApplicationStatus
    ).toHaveBeenCalledWith(
      dbMock,
      "app-1",
      expect.objectContaining({
        status: "rejected",
        rejectionReason: "Need more detail",
      })
    )
  })

  it.each([
    "approved",
    "rejected",
  ])("refuses to review a request already %s", async (status) => {
    onboardingRepo.findOnboardingApplicationById.mockResolvedValue([
      storedRow({ status }),
    ])

    await expect(
      approveOnboardingApplicationUseCase({ reviewerId: "admin-1" }, "app-1")
    ).rejects.toThrow(/already been reviewed/i)
    await expect(
      rejectOnboardingApplicationUseCase({ reviewerId: "admin-1" }, "app-1")
    ).rejects.toThrow(/already been reviewed/i)
  })

  it("refuses to approve someone who already belongs to an organization", async () => {
    onboardingRepo.findOnboardingApplicationById.mockResolvedValue([
      storedRow(),
    ])
    organizationRepo.findMembershipByUser.mockResolvedValue([{ id: "mem-1" }])

    await expect(
      approveOnboardingApplicationUseCase({ reviewerId: "admin-1" }, "app-1")
    ).rejects.toThrow(/already belongs to an organization/i)
  })
})

describe("claiming an approved workspace at registration", () => {
  const approvedRow = () =>
    storedRow({ userId: null, status: "approved", organizationId: "org-1" })

  beforeEach(() => {
    vi.clearAllMocks()
    organizationRepo.findMembershipByUser.mockResolvedValue([])
    organizationRepo.findOrganizationById.mockResolvedValue([
      { id: "org-1", slug: "kampala-builders" },
    ])
    onboardingRepo.findApprovedOnboardingApplicationByEmail.mockResolvedValue([
      approvedRow(),
    ])
  })

  it("makes the new user owner of the workspace held for their email", async () => {
    const result = await claimApprovedApplicationUseCase({
      userId: "user-9",
      email: "ada@example.com",
    })

    expect(result).toEqual({ organizationId: "org-1", slug: "kampala-builders" })
    expect(organizationRepo.createOrganizationMember).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        organizationId: "org-1",
        role: "owner",
        userId: "user-9",
      })
    )
    expect(onboardingRepo.linkOnboardingApplicationUser).toHaveBeenCalledWith(
      expect.anything(),
      "app-1",
      "user-9"
    )
  })

  it("matches the request regardless of the case they type their email in", async () => {
    await claimApprovedApplicationUseCase({
      userId: "user-9",
      email: "Ada@Example.com",
    })

    expect(
      onboardingRepo.findApprovedOnboardingApplicationByEmail
    ).toHaveBeenCalledWith(expect.anything(), "ada@example.com")
  })

  it("ignores a registration with no approved request", async () => {
    onboardingRepo.findApprovedOnboardingApplicationByEmail.mockResolvedValue([])

    const result = await claimApprovedApplicationUseCase({
      userId: "user-9",
      email: "stranger@example.com",
    })

    expect(result).toBeNull()
    expect(organizationRepo.createOrganizationMember).not.toHaveBeenCalled()
  })

  it("refuses to hand the same workspace to a second account", async () => {
    onboardingRepo.findApprovedOnboardingApplicationByEmail.mockResolvedValue([
      approvedRow(),
    ])
    onboardingRepo.findApprovedOnboardingApplicationByEmail.mockResolvedValue([
      storedRow({ userId: "user-1", status: "approved", organizationId: "org-1" }),
    ])

    const result = await claimApprovedApplicationUseCase({
      userId: "user-9",
      email: "ada@example.com",
    })

    expect(result).toBeNull()
    expect(organizationRepo.createOrganizationMember).not.toHaveBeenCalled()
  })

  it("does not move someone who already belongs to an organization", async () => {
    organizationRepo.findMembershipByUser.mockResolvedValue([
      { organizationId: "org-other" },
    ])

    const result = await claimApprovedApplicationUseCase({
      userId: "user-9",
      email: "ada@example.com",
    })

    expect(result).toBeNull()
    expect(organizationRepo.createOrganizationMember).not.toHaveBeenCalled()
  })
})
