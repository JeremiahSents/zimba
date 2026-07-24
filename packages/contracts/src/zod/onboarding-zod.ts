import { z } from "zod"
import { boundedNameSchema, emailSchema, idSchema } from "./shared-zod"

export const onboardingApplicationStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
])

export const onboardingApplicationSchema = z.object({
  fullName: boundedNameSchema.min(2).max(100),
  companyName: boundedNameSchema.min(2).max(120),
  companyWebsite: z.string().url().optional().or(z.literal("")),
  industry: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  teamSize: z.string().max(50).optional().or(z.literal("")),
  useCase: z.string().max(2000).optional().or(z.literal("")),
})

export const onboardingApplicationReviewSchema = z.object({
  applicationId: idSchema,
  status: onboardingApplicationStatusSchema,
  rejectionReason: z.string().max(2000).optional().or(z.literal("")),
})
