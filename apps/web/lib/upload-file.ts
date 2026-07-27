import { genUploader } from "uploadthing/client"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { ApplicationError } from "@/core/shared/errors"
import type { FileUploadPurpose } from "@/lib/types"

const { uploadFiles } = genUploader<OurFileRouter>()

export async function uploadZimbaFile(
  file: File,
  purpose: FileUploadPurpose
): Promise<string> {
  const uploaded = await uploadFiles("zimbaUploader", {
    files: [file],
    headers: { "x-upload-purpose": purpose },
  }).catch((error: unknown) => {
    const offline = typeof navigator !== "undefined" && !navigator.onLine
    throw new ApplicationError(
      offline ? "NETWORK_UNAVAILABLE" : "UPLOAD_FAILED",
      undefined,
      { cause: error }
    )
  })

  if (!uploaded || uploaded.length === 0) {
    throw new ApplicationError("UPLOAD_FAILED")
  }

  const result = uploaded[0]
  if (!result?.serverData?.fileId) {
    throw new ApplicationError("UPLOAD_FAILED")
  }

  return result.serverData.fileId
}
