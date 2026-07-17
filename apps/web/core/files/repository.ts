import "server-only"
import { db, schema } from "../shared/db"

export async function createUploadedFile(data: typeof schema.uploadedFile.$inferInsert) {
  const [file] = await db.insert(schema.uploadedFile).values(data).returning()
  return file
}

export async function createProjectAttachment(data: typeof schema.projectAttachment.$inferInsert) {
  const [attachment] = await db.insert(schema.projectAttachment).values(data).returning()
  return attachment
}
