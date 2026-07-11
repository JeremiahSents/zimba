# Project creation page design

## Goal

Replace the project creation sheet with a dedicated route that captures project metadata, client-side attachments, and an editable initial allocation budget.

## Route and navigation

- Add `/dashboard/projects/new` inside the existing dashboard shell.
- Replace the existing `ProjectCreateSheet` triggers with links to the new route.
- Cancel returns to `/dashboard/projects`.
- Successful creation updates the current local/mock project state and redirects to the new project detail route.

## Project details

The form captures required project name, location, land size, and building type. Validation is inline and prevents submission when required text is missing or numeric values are invalid.

## Attachments

- Accept multiple image and document files.
- Keep selected files client-side only until an API is available.
- Render image thumbnails and filename/type rows for documents.
- Every selected file can be removed before submission.

## Allocation editor

Use an inline-editable table with the columns `Expense name`, `Budget`, `Unit cost`, and `Total spent so far`.

- Start with useful rows for land, labour, and materials.
- Allow adding and removing rows.
- Keep currency values numeric while editing and format them for display.
- Sum the budget column into the created project's total budget.
- On mobile, stack each row into a compact editable block.

## Data flow

The page owns draft form state, attachment state, and allocation rows. On submit it creates a local project object compatible with the existing dashboard mock data (`budget`, `spent`, `remaining`, and `pct`), updates the projects collection, and navigates to the project detail view. No upload request is made.

## Verification

- Typecheck and lint the web app.
- Verify route navigation from both the dashboard home action and projects page action.
- Verify validation, attachment removal, row editing, budget totals, cancel, and successful redirect at desktop and mobile widths.
