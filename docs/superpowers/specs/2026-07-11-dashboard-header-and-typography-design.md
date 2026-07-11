# Dashboard header and typography design

## Goal

Make account access visually quieter and give every dashboard page a consistent, compact type hierarchy.

## Header and navigation

- Remove the account/profile row from the sidebar footer. Settings remains in the footer.
- Replace the header's `New expense` action with a display-only Shadcn avatar immediately after the notification bell.
- The avatar uses the existing shared avatar component and has an accessible label. It does not navigate or open a menu.
- Keep the notification sheet and responsive sidebar toggle behaviour unchanged.

## Typography scale

Apply these semantic sizes throughout dashboard feature pages and shared dashboard components:

| Role | Size | Intended use |
| --- | --- | --- |
| H1 | 20px | Page titles |
| H2 | 16px | Primary card and section titles |
| H3 | 14px | Subsections and prominent row titles |
| H4 | 12px | Labels, column headings, and secondary headings |
| H5 | 10px | Metadata, helper text, and compact status context |

Body content retains a readable 12px or 14px size according to its existing visual importance; the specified scale is the hierarchy for every dashboard text role rather than forcing all prose into heading sizes.

## Implementation boundaries

- Update the shared dashboard shell and sidebar so the header/navigation change covers every dashboard route.
- Update dashboard feature and shared components to map existing text classes to the scale above, without changing data, routing, or interactions.
- Do not alter the active, unrelated dashboard work already present in the working tree.

## Verification

- Typecheck and lint the web app.
- Check the dashboard at desktop and narrow widths: the avatar remains adjacent to the bell, the profile row is absent from the sidebar, and headings follow the approved scale.
