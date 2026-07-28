import { and, eq } from "drizzle-orm"
import { project } from "../projects/schema"
import { expense } from "../receipts/schema"
import type { DatabaseExecutor } from "../shared/executor"
import { file, projectAttachment } from "./schema"

export function findFileForOrganization(
  executor: DatabaseExecutor,
  organizationId: string,
  fileId: string
) {
  return executor
    .select()
    .from(file)
    .where(and(eq(file.organizationId, organizationId), eq(file.id, fileId)))
    .limit(1)
}

export function listFilesForOrganization(
  executor: DatabaseExecutor,
  organizationId: string
) {
  return executor
    .select()
    .from(file)
    .where(eq(file.organizationId, organizationId))
}

export async function createUploadedFile(
  executor: DatabaseExecutor,
  data: typeof file.$inferInsert
) {
  const [created] = await executor.insert(file).values(data).returning()
  return created
}

export async function createProjectAttachment(
  executor: DatabaseExecutor,
  data: typeof projectAttachment.$inferInsert
) {
  const [projectRow] = await executor
    .select({ id: project.id })
    .from(project)
    .where(
      and(
        eq(project.id, data.projectId),
        eq(project.organizationId, data.organizationId)
      )
    )
    .limit(1)
  const [attachedFile] = await executor
    .select({ id: file.id })
    .from(file)
    .where(
      and(
        eq(file.id, data.fileId),
        eq(file.organizationId, data.organizationId),
        eq(file.status, "completed"),
        eq(file.purpose, "project_attachment")
      )
    )
    .limit(1)
  if (!projectRow || !attachedFile) return undefined
  const [attachment] = await executor
    .insert(projectAttachment)
    .values(data)
    .returning()
  return attachment
}

export function listProjectAttachments(
  executor: DatabaseExecutor,
  organizationId: string,
  projectId: string
) {
  return executor
    .select({ file: file })
    .from(projectAttachment)
    .innerJoin(file, eq(file.id, projectAttachment.fileId))
    .where(
      and(
        eq(projectAttachment.organizationId, organizationId),
        eq(projectAttachment.projectId, projectId)
      )
    )
}

export async function findCompletedFile(
  executor: DatabaseExecutor,
  organizationId: string,
  fileId: string,
  purpose?: string
) {
  const filters = [
    eq(file.id, fileId),
    eq(file.organizationId, organizationId),
    eq(file.status, "completed"),
  ]
  if (purpose) filters.push(eq(file.purpose, purpose))
  const [completedFile] = await executor
    .select()
    .from(file)
    .where(and(...filters))
    .limit(1)
  return completedFile
}

export async function auditLegacyFiles(
  executor: DatabaseExecutor,
  organizationId: string
) {
  const [files, expenses, attachments] = await Promise.all([
    executor
      .select({
        id: file.id,
        key: file.key,
        url: file.url,
        status: file.status,
      })
      .from(file)
      .where(eq(file.organizationId, organizationId)),
    executor
      .select({ id: expense.id, receiptFileId: expense.receiptFileId })
      .from(expense)
      .where(eq(expense.organizationId, organizationId)),
    executor
      .select({
        fileId: projectAttachment.fileId,
        projectId: projectAttachment.projectId,
      })
      .from(projectAttachment)
      .where(eq(projectAttachment.organizationId, organizationId)),
  ])
  const knownFileIds = new Set(files.map((file) => file.id))
  const invalidReceiptFileReferences = expenses
    .filter(
      (item) => item.receiptFileId && !knownFileIds.has(item.receiptFileId)
    )
    .map((item) => item.id)
  return {
    fileCount: files.length,
    completedFileCount: files.filter((file) => file.status === "completed")
      .length,
    receiptFileReferences: expenses.filter((item) => item.receiptFileId).length,
    invalidReceiptFileReferences,
    projectAttachments: attachments.length,
  }
}
