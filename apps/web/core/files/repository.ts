import "server-only"
import { db } from "@workspace/db"
import { createProjectAttachment as insertProjectAttachment, createUploadedFile as insertUploadedFile, auditLegacyFiles, findCompletedFile, listProjectAttachments as listProjectAttachmentRows } from "@workspace/db/repositories"
import type { projectAttachment, uploadedFile } from "@workspace/db/schema"

export function createUploadedFile(data: typeof uploadedFile.$inferInsert) { return insertUploadedFile(db, data) }
export function createProjectAttachment(data: typeof projectAttachment.$inferInsert) { return insertProjectAttachment(db, data) }
export function listProjectAttachments(organizationId: string, projectId: string) { return listProjectAttachmentsForOrganization(organizationId, projectId) }
export function listProjectAttachmentsForOrganization(organizationId: string, projectId: string) { return listProjectAttachmentRows(db, organizationId, projectId) }
export function getCompletedFile(organizationId: string, fileId: string, purpose?: string) { return findCompletedFile(db, organizationId, fileId, purpose) }
export function getLegacyFileAudit(organizationId: string) { return auditLegacyFiles(db, organizationId) }
