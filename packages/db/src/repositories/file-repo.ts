import { and, eq } from "drizzle-orm"
import { uploadedFile } from "../schemas/file-schema"
import type { DatabaseExecutor } from "./types"

export function findFileForOrganization(executor: DatabaseExecutor, organizationId: string, fileId: string) {
  return executor.select().from(uploadedFile).where(and(eq(uploadedFile.organizationId, organizationId), eq(uploadedFile.id, fileId))).limit(1)
}

export function listFilesForOrganization(executor: DatabaseExecutor, organizationId: string) {
  return executor.select().from(uploadedFile).where(eq(uploadedFile.organizationId, organizationId))
}
