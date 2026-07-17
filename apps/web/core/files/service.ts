import "server-only"
import { requireSession } from "../auth/service"
import * as fileRepo from "./repository"

export async function recordUploadedFile(data: {
  key: string
  url: string
  filename: string
  contentType: string
  sizeBytes: number
  purpose: string
}) {
  const { user, organization } = await requireSession()
  
  const fileId = crypto.randomUUID()
  const file = await fileRepo.createUploadedFile({
    id: fileId,
    organizationId: organization.organizationId,
    uploaderId: user.id,
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
