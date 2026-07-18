import { uploadFiles } from "@/lib/uploadthing"
import type { FileUploadPurpose } from "@/lib/types"

export async function uploadZimbaFile(
  file: File,
  purpose: FileUploadPurpose
): Promise<string> {
  const uploaded = await uploadFiles("zimbaUploader", {
    files: [file],
    headers: {
      "x-upload-purpose": purpose,
    },
  })

  if (!uploaded || uploaded.length === 0) {
    throw new Error("File upload failed.")
  }

  const result = uploaded[0]
  if (!result?.serverData?.fileId) {
    throw new Error("Upload response did not return a file ID.")
  }

  return result.serverData.fileId
}
