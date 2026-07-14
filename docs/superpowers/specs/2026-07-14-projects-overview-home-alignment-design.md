# Projects Overview Home Alignment

## Goal

Align the Projects overview page with the Home dashboard's visual language while retaining the search and pagination needed on a dedicated portfolio page.

## Page hierarchy

The page keeps its existing Projects title and subtitle. A compact section header beneath it contains an `Overview` heading and a `New project` action linking to `/admin/projects/new`. The action sits above the metric cards rather than inside the projects list.

## Metric cards

Show three independent cards in the same responsive grid, dimensions, padding, typography, icon treatment, and spacing used by the Home overview:

1. Total projects
2. On track
3. Portfolio value

Each card contains only its label, icon, and primary value. Remove the `Portfolio`, healthy-count, and `Approved` pills. The cards stack responsively using the Home grid behavior.

## Project list

Replace the current project table with the same row presentation used by Home's Active projects section. Each row continues to link to its project detail page and displays project identity, location and plot size, budget health, utilization progress, spent value, and remaining value.

The dedicated Projects page retains:

- The `All projects` heading and portfolio description.
- Search across project data.
- The filtered project count.
- Pagination controls and page count.

The list is not wrapped in an additional rounded card. The rows themselves use the same bordered, divided container as Home. Existing empty-state behavior remains available when no projects match.

## Component boundaries

Extract or extend the Home project-row presentation so both Home and Projects consume one shared implementation. The Projects page owns filtering and pagination; the shared list/row components own only presentation and project-detail links. This prevents the two views from drifting visually.

## Data and behavior

No API or persisted-data changes are required. Continue merging locally created projects with dashboard data. Search and pagination operate on that merged list. A search change resets pagination when needed so the user is not left on an empty page.

## Accessibility and responsive behavior

The search input has an accessible label, project names remain keyboard-accessible links, and navigation controls retain disabled states. On small screens, metrics stack and project rows collapse to the same responsive layout used on Home without horizontal scrolling.

## Verification

- Confirm metric cards visually match Home and contain no pills.
- Confirm `New project` appears above the cards and navigates correctly.
- Confirm Projects and Home render the same project-row design.
- Confirm filtering, counts, pagination, empty state, and detail links work.
- Run formatting, type checking, linting, React Doctor, and browser checks at desktop and narrow viewport widths.
