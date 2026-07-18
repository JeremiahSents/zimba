import "server-only"
import { and, eq } from "drizzle-orm"
import { db, schema } from "../shared/db"

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
