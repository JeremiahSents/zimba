import { createUploadthing, type FileRouter } from "uploadthing/next"
import { requireSession } from "@/core/auth/service"
import { recordUploadedFile } from "@/core/files/service"

const f = createUploadthing()

export const ourFileRouter = {
  zimbaUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      const { user, organization } = await requireSession()

      const purpose = req.headers.get("x-upload-purpose") || "attachment"

      return {
        userId: user.id,
        organizationId: organization.organizationId,
        purpose,
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Record the file in the database
      const dbFile = await recordUploadedFile({
        organizationId: metadata.organizationId,
        uploaderId: metadata.userId,
        key: file.key,
        url: file.ufsUrl,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        purpose: metadata.purpose,
      })

      if (!dbFile) throw new Error("Uploaded file metadata could not be saved.")
      return { fileId: dbFile.id, url: file.ufsUrl }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
