# Dashboard Card and Typography System Design

## Objective

Refine the entire Zimba dashboard so its surfaces feel integrated into the screen rather than layered above it. Standardize card composition and typography, correct chart sizing, and make information hierarchy consistent across Home, Analytics, Projects, Budget, Expenses, Suppliers, Reports, Team, and Settings.

## Visual Direction

Use a quiet, utilitarian financial-dashboard aesthetic. Content should provide hierarchy through typography, spacing, and alignment. Containers should provide subtle grouping without becoming the dominant visual feature.

Cards use the page color or a nearly identical surface, one low-contrast border, and no decorative outer ring. Shadows are reserved for temporary elevated UI such as tooltips, menus, popovers, and sheets. Corner radii remain restrained and consistent.

## Shared Card System

The shared shadcn-style card primitive is the source of truth for dashboard panels.

- `Card` defines the quiet surface, border, radius, overflow behavior, and shared spacing variable.
- `CardHeader` holds heading content and optional actions.
- `CardTitle` provides the standard 14px card heading.
- `CardDescription` provides supporting 12px copy.
- `CardAction` aligns filters, selectors, and compact actions with the header.
- `CardContent` owns panel body padding.
- `CardFooter` is used only for genuine footer actions or summaries.

Dashboard pages should not recreate card headers with unrelated `div`, `p`, or `h2` styling. Specialized panels may adjust spacing through class names but retain the semantic composition.

Cards use a single subtle border and no simultaneous border-plus-ring treatment. Nested rows and table items should use dividers or a muted inset surface instead of appearing as multiple elevated cards.

## Typography Scale

Typography follows a compact hierarchy based on the supplied reference:

| Role | Size | Weight | Notes |
| --- | ---: | ---: | --- |
| Dashboard page title | 20px | 600 | Tight tracking; one per page |
| Primary metric | 20–24px | 600 | Tabular figures; size depends on available width |
| Section heading | 16px | 600 | Used outside cards for major page sections |
| Card title | 14px | 500–600 | Shared `CardTitle` default |
| Body and card description | 12px | 400 | Relaxed line height and muted color where secondary |
| Labels and controls | 11–12px | 500 | Avoid excessive uppercase treatment |
| Metadata and chart axes | 10–11px | 400–500 | Must remain legible and secondary |

Numeric content uses tabular figures. Bold is reserved for primary values, important totals, and active states. Descriptions should not compete with headings. Page and card headings use the existing heading family; body copy uses the existing sans family to avoid expanding scope into a font migration.

## Layout and Spacing

Use consistent page-section gaps and card padding across dashboard routes. Card headers have a compact title-to-description gap and a clearer gap before content. Header actions align to the title block rather than floating independently.

Dense content such as transactions, projects, reports, and suppliers should use a single containing surface with row dividers. Repeated inner borders and nested rounded rectangles are reduced. Empty states retain a dashed boundary only when it communicates an available drop zone or missing collection.

Responsive behavior preserves hierarchy:

- Header actions wrap beneath titles on narrow screens.
- Metric groups collapse without doubled borders.
- Charts use available width without fixed dimensions that overflow or become visually undersized.
- Tables retain their existing responsive behavior while inheriting the new type scale.

## Charts

All charts share quieter grid lines, consistent 10–11px axis labels, compact tooltips, and controlled accent colors.

The pie or donut chart uses a responsive square plotting region with an explicit maximum size. Its outer and inner radii derive from the container so the visualization remains large enough to read without crowding its legend. The legend sits in a predictable area and uses the shared label and metadata styles. The chart must not rely on a fixed pixel height that produces a small pie inside a large card.

Bar and area charts receive the same typography and tooltip treatment. Decorative chart elements should not overpower the data.

## Page Migration

The refinement applies to all routes within the dashboard. Each page will be audited for:

1. Panels that bypass shared card subcomponents.
2. Duplicate border, ring, radius, and shadow styling.
3. One-off heading and metadata sizes.
4. Nested card treatments that can become rows or divided groups.
5. Chart containers with fixed or imbalanced dimensions.

Existing application behavior, data structures, navigation, tables, and actions remain unchanged.

## Accessibility and Interaction

Text and muted labels must maintain readable contrast. Focus rings remain visible even though decorative card rings are removed. Interactive controls retain clear hover, focus, disabled, and pressed states. The visual refactor introduces no necessary motion; frequently used dashboard interactions should remain immediate.

## Verification

Implementation is complete when:

- Every dashboard route renders without type or lint errors.
- Cards use one quiet surface treatment and no decorative outer ring.
- Dashboard panels consistently use shared card subcomponents where semantically appropriate.
- The typography hierarchy matches the documented scale without arbitrary repeated one-off sizes.
- Pie or donut charts remain balanced at desktop, tablet, and mobile widths.
- Existing dashboard interactions and data presentation continue to work.
- Visual checks confirm that the information is more prominent than the containers.

