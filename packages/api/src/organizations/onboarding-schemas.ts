import { z } from "zod"
import { boundedNameSchema, emailSchema, idSchema } from "../shared/schemas"

/**
 * `rejected` is what a declined request is called in the database. The admin UI
 * says "declined"; the stored value is left alone so no data has to move.
 */
export const onboardingApplicationStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
])

/**
 * The three required fields are what a super admin needs to decide on a demo
 * request: who they are, who they work for, and where to reach them. Everything
 * else is optional context the applicant may add.
 */
export const onboardingApplicationSchema = z.object({
  fullName: boundedNameSchema.min(2).max(100),
  companyName: boundedNameSchema.min(2).max(120),
  email: emailSchema,
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
