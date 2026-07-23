import { z } from "zod"
import { boundedTextSchema, idSchema } from "./shared-zod"
export const filePurposeSchema = z.string().trim().min(1).max(80)
export const fileMetadataSchema = z.object({
  organizationId: idSchema,
  filename: boundedTextSchema.min(1).max(255),
  contentType: z.string().trim().min(1).max(160),
  sizeBytes: z.number().int().nonnegative().max(1_000_000_000),
  purpose: filePurposeSchema,
})
