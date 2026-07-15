# Project files page

## Goal

Give users a dedicated, responsive place to view files uploaded for a project, with a clear link beside the project location on the project detail screen.

## Design

Add `/admin/projects/[id]/files`. The server route loads the project and renders a focused files page with project breadcrumb, title, location context, and a back-to-project link. Images appear in a responsive preview grid; PDFs and other uploads appear as document rows with filename, type/size metadata, and an open link. If no attachments exist, the page explains that project files will appear there after upload.

The project detail location line gets a compact `View files and images` link. It wraps naturally below the location on narrow screens and remains keyboard accessible.

## Data flow

Extend the UI project detail model with optional attachment metadata. The mock repository derives metadata from completed project uploads when a project is created, allowing the new page to be exercised locally. The API path remains backward-compatible: when the backend detail response does not yet include attachment metadata, the page shows the empty state rather than inventing file URLs.

## Verification

Typecheck, lint, and production build the web app. Manually verify the detail link, image/document presentation, empty state, and phone-width wrapping.
