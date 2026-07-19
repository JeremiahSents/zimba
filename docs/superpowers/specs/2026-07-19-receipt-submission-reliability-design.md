# Receipt submission reliability

## Goal

Make receipt creation reject invalid numeric input before uploading, survive transient Server Action transport failures without duplicating the attachment, and use UploadThing's supported file URL property.

## Design

The receipt form validates every allocation, quantity, and unit amount as a finite number, with allocation and quantity required to be positive and unit amount non-negative. Validation runs before the optional attachment upload.

After an attachment uploads successfully, its database file ID is retained in component state. A retry reuses that ID while the selected file is unchanged. Selecting a different file clears the cached ID. The Server Action invocation is wrapped in error handling so ngrok or other transport failures produce a retryable message and always restore the form's non-saving state.

The Server Action independently rejects non-finite numeric values, preserving the server as the validation boundary. UploadThing persistence and callback data use `file.ufsUrl` instead of the deprecated `file.url`.

## Error handling

- Invalid form input is reported before network activity.
- Upload failures keep the form data and show the existing public upload error.
- Server Action transport failures keep the form and uploaded file ID, allowing a safe retry without a duplicate upload.
- Expected Server Action failures continue to display their returned public error.

## Verification

Add focused tests for numeric receipt validation where practical, run the web package tests and TypeScript check, and inspect the final diff to ensure unrelated working-tree changes remain intact.
