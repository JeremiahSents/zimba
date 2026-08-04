export type OnboardingApplicationStatus = "pending" | "approved" | "rejected"

export type OnboardingApplicationDto = {
  id: string
  /** Null until the applicant registers and claims the approved workspace. */
  userId: string | null
  fullName: string
  email: string
  companyName: string
  companyWebsite: string | null
  industry: string | null
  country: string | null
  phone: string | null
  teamSize: string | null
  useCase: string | null
  status: OnboardingApplicationStatus
  organizationId: string | null
  reviewedBy: string | null
  reviewedAt: Date | null
  rejectionReason: string | null
  createdAt: Date
  updatedAt: Date
}

export type OnboardingApplicationListDto = {
  id: string
  fullName: string
  email: string
  companyName: string
  industry: string | null
  country: string | null
  status: OnboardingApplicationStatus
  createdAt: Date
}
