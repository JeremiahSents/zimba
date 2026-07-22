import { and, eq } from "drizzle-orm"
import { expense } from "../schemas/receipt-schema"
import { project } from "../schemas/project-schema"
import { documentLink, projectAttachment, uploadedFile } from "../schemas/file-schema"
import type { DatabaseExecutor } from "./types"

export function findFileForOrganization(executor: DatabaseExecutor, organizationId: string, fileId: string) {
  return executor.select().from(uploadedFile).where(and(eq(uploadedFile.organizationId, organizationId), eq(uploadedFile.id, fileId))).limit(1)
}

export function listFilesForOrganization(executor: DatabaseExecutor, organizationId: string) {
  return executor.select().from(uploadedFile).where(eq(uploadedFile.organizationId, organizationId))
}

export async function createUploadedFile(executor: DatabaseExecutor, data: typeof uploadedFile.$inferInsert) {
  const [created] = await executor.insert(uploadedFile).values(data).returning()
  return created
}

export async function createProjectAttachment(executor: DatabaseExecutor, data: typeof projectAttachment.$inferInsert) {
  const [projectRow] = await executor.select({ id: project.id }).from(project).where(and(eq(project.id, data.projectId), eq(project.organizationId, data.organizationId))).limit(1)
  const [file] = await executor.select({ id: uploadedFile.id }).from(uploadedFile).where(and(eq(uploadedFile.id, data.fileId), eq(uploadedFile.organizationId, data.organizationId), eq(uploadedFile.status, "completed"), eq(uploadedFile.purpose, "project_attachment"))).limit(1)
  if (!projectRow || !file) return undefined
  const [attachment] = await executor.insert(projectAttachment).values(data).returning()
  return attachment
}

export function listProjectAttachments(executor: DatabaseExecutor, organizationId: string, projectId: string) {
  return executor.select({ file: uploadedFile }).from(projectAttachment).innerJoin(uploadedFile, eq(uploadedFile.id, projectAttachment.fileId)).where(and(eq(projectAttachment.organizationId, organizationId), eq(projectAttachment.projectId, projectId)))
}

export async function findCompletedFile(executor: DatabaseExecutor, organizationId: string, fileId: string, purpose?: string) {
  const filters = [eq(uploadedFile.id, fileId), eq(uploadedFile.organizationId, organizationId), eq(uploadedFile.status, "completed")]
  if (purpose) filters.push(eq(uploadedFile.purpose, purpose))
  const [file] = await executor.select().from(uploadedFile).where(and(...filters)).limit(1)
  return file
}

export async function auditLegacyFiles(executor: DatabaseExecutor, organizationId: string) {
  const [files, expenses, links, attachments] = await Promise.all([
    executor.select({ id: uploadedFile.id, key: uploadedFile.key, url: uploadedFile.url, status: uploadedFile.status }).from(uploadedFile).where(eq(uploadedFile.organizationId, organizationId)),
    executor.select({ id: expense.id, receiptFileId: expense.receiptFileId }).from(expense).where(eq(expense.organizationId, organizationId)),
    executor.select({ documentId: documentLink.documentId, entityType: documentLink.entityType, entityId: documentLink.entityId }).from(documentLink).where(eq(documentLink.organizationId, organizationId)),
    executor.select({ fileId: projectAttachment.fileId, projectId: projectAttachment.projectId }).from(projectAttachment).where(eq(projectAttachment.organizationId, organizationId)),
  ])
  const knownFileIds = new Set(files.map((file) => file.id))
  const invalidReceiptFileReferences = expenses.filter((item) => item.receiptFileId && !knownFileIds.has(item.receiptFileId)).map((item) => item.id)
  return { fileCount: files.length, completedFileCount: files.filter((file) => file.status === "completed").length, receiptFileReferences: expenses.filter((item) => item.receiptFileId).length, invalidReceiptFileReferences, documentLinks: links.length, projectAttachments: attachments.length }
}
