import "server-only"
import * as fileRepo from "./repository"

export async function recordUploadedFile(data: {
  organizationId: string
  uploaderId: string
  key: string
  url: string
  filename: string
  contentType: string
  sizeBytes: number
  purpose: string
}) {
  const file = await fileRepo.createUploadedFile({
    organizationId: data.organizationId,
    uploaderId: data.uploaderId,
    key: data.key,
    url: data.url,
    filename: data.filename,
    contentType: data.contentType,
    sizeBytes: data.sizeBytes,
    purpose: data.purpose,
    status: "completed",
  })

  return file
}
