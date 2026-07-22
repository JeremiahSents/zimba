import { z } from "zod"
import { boundedNameSchema, currencyCodeSchema, idSchema } from "./shared-zod"
export const projectStatusSchema = z.enum(["active", "archived"])
export const projectInputSchema = z.object({ organizationId: idSchema, name: boundedNameSchema, location: z.string().trim().min(1).max(240), currency: currencyCodeSchema.default("UGX") })
export const projectIdSchema = z.object({ organizationId: idSchema, projectId: idSchema })
