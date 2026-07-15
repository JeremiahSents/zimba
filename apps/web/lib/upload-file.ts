import {
  completeFileUploadAction,
  requestFileUploadAction,
} from "@/app/admin/actions"
import type { FileUploadPurpose } from "@/lib/types"

export async function uploadZimbaFile(
  file: File,
  purpose: FileUploadPurpose
): Promise<string> {
  const requested = await requestFileUploadAction({
    content_type: file.type || "application/octet-stream",
    filename: file.name,
    purpose,
    size_bytes: file.size,
  })
  if (!requested.ok) throw new Error(requested.error)

  if (!requested.data.upload_url.startsWith("mock://")) {
    const uploadHeaders = new Headers()
    for (const [name, value] of Object.entries(requested.data.headers)) {
      if (typeof value === "string") uploadHeaders.set(name, value)
    }

    const uploaded = await fetch(toSecureUploadUrl(requested.data.upload_url), {
      body: file,
      headers: uploadHeaders,
      method: "PUT",
    })
    if (!uploaded.ok) {
      throw new Error(`File upload failed with status ${uploaded.status}.`)
    }
  }

  const completed = await completeFileUploadAction(requested.data.file_id)
  if (!completed.ok) throw new Error(completed.error)
  return completed.data.id
}

function toSecureUploadUrl(value: string) {
  const url = new URL(value)

  // The backend currently builds direct-upload URLs with http://. Browsers
  // block those URLs when the Zimba app is served over HTTPS.
  if (
    url.protocol === "http:" &&
    typeof window !== "undefined" &&
    window.location.protocol === "https:"
  ) {
    url.protocol = "https:"
  }

  return url.toString()
}
