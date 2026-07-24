import type { DatabaseExecutor } from "@workspace/db/repositories"
import {
  createUploadedFile,
  listProjectAttachments,
} from "@workspace/db/repositories"
import { z } from "zod"
import { validationError } from "../shared/application-error"
import type { WorkspaceContext } from "../shared/workspace-context"

const recordUploadedFileSchema = z.object({
  key: z.string().trim().min(1),
  url: z.string().trim().url(),
  filename: z.string().trim().min(1).max(512),
  contentType: z.string().trim().min(1).max(255),
  sizeBytes: z.number().int().nonnegative(),
  purpose: z.string().trim().min(1).max(120),
})

export async function recordUploadedFileUseCase(
  ctx: WorkspaceContext,
  deps: { executor: DatabaseExecutor },
  rawInput: unknown
) {
  const input = recordUploadedFileSchema.safeParse(rawInput)
  if (!input.success) validationError("Invalid uploaded file input.")

  return createUploadedFile(deps.executor, {
    organizationId: ctx.organizationId,
    uploaderId: ctx.userId,
    key: input.data.key,
    url: input.data.url,
    filename: input.data.filename,
    contentType: input.data.contentType,
    sizeBytes: input.data.sizeBytes,
    purpose: input.data.purpose,
    status: "completed",
  })
}

export function listProjectAttachmentsUseCase(
  ctx: Pick<WorkspaceContext, "organizationId">,
  deps: { executor: DatabaseExecutor },
  projectId: string
) {
  if (!projectId.trim()) validationError("Project id is required.")
  return listProjectAttachments(deps.executor, ctx.organizationId, projectId)
}
