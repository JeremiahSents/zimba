import "server-only"
import { and, eq } from "drizzle-orm"
import { db, schema } from "@workspace/db"

export async function createUploadedFile(data: typeof schema.uploadedFile.$inferInsert) {
  const [file] = await db.insert(schema.uploadedFile).values(data).returning()
  return file
}

export async function createProjectAttachment(data: typeof schema.projectAttachment.$inferInsert) {
  const [attachment] = await db.insert(schema.projectAttachment).values(data).returning()
  return attachment
}

export async function listProjectAttachments(organizationId: string, projectId: string) {
  return db.select({ file: schema.uploadedFile }).from(schema.projectAttachment).innerJoin(schema.uploadedFile, eq(schema.uploadedFile.id, schema.projectAttachment.fileId)).where(and(eq(schema.projectAttachment.organizationId, organizationId), eq(schema.projectAttachment.projectId, projectId)))
}

export async function getCompletedFile(organizationId: string, fileId: string) {
  const [file] = await db.select().from(schema.uploadedFile).where(and(eq(schema.uploadedFile.id, fileId), eq(schema.uploadedFile.organizationId, organizationId), eq(schema.uploadedFile.status, "completed"))).limit(1)
  return file
}

/** Read-only inventory for assessing legacy attachment recovery. */
export async function getLegacyFileAudit(organizationId: string) {
  const [files, expenses, links, attachments] = await Promise.all([
    db.select({ id: schema.uploadedFile.id, key: schema.uploadedFile.key, url: schema.uploadedFile.url, status: schema.uploadedFile.status }).from(schema.uploadedFile).where(eq(schema.uploadedFile.organizationId, organizationId)),
    db.select({ id: schema.expense.id, receiptFileId: schema.expense.receiptFileId }).from(schema.expense).where(eq(schema.expense.organizationId, organizationId)),
    db.select({ documentId: schema.documentLink.documentId, entityType: schema.documentLink.entityType, entityId: schema.documentLink.entityId }).from(schema.documentLink).where(eq(schema.documentLink.organizationId, organizationId)),
    db.select({ fileId: schema.projectAttachment.fileId, projectId: schema.projectAttachment.projectId }).from(schema.projectAttachment).where(eq(schema.projectAttachment.organizationId, organizationId)),
  ])
  const knownFileIds = new Set(files.map((file) => file.id))
  const invalidReceiptFileReferences = expenses.filter((expense) => expense.receiptFileId && !knownFileIds.has(expense.receiptFileId)).map((expense) => expense.id)
  return { fileCount: files.length, completedFileCount: files.filter((file) => file.status === "completed").length, receiptFileReferences: expenses.filter((expense) => expense.receiptFileId).length, invalidReceiptFileReferences, documentLinks: links.length, projectAttachments: attachments.length }
}
