import "server-only"
import { recordUploadedFileUseCase } from "@workspace/api"
import { apiExecutor } from "@workspace/api-runtime"

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
  return recordUploadedFileUseCase(
    {
      organizationId: data.organizationId,
      userId: data.uploaderId,
      role: "viewer",
    },
    apiExecutor,
    {
      key: data.key,
      url: data.url,
      filename: data.filename,
      contentType: data.contentType,
      sizeBytes: data.sizeBytes,
      purpose: data.purpose,
    }
  )
}
