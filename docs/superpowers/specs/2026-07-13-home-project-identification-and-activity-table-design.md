# Home project identification and activity table design

## Goal

Make active projects easier to distinguish without inventing project imagery, and present recent activity in a compact, scannable table.

## Active projects

- Do not use the shared placeholder image because project-specific images are not available.
- Add a text-primary project icon and a data-backed descriptor such as plot size alongside each project identity.
- Keep the project name, location, budget progress, spend/remaining context, and project link unchanged.

## Recent activity

- Replace the current activity-list layout with a responsive table-like presentation.
- Desktop rows show activity description, project and supplier context, amount, and date in separate aligned columns.
- Narrow layouts collapse the context into the main activity cell to retain readability.
- Keep existing activity links, amounts, dates, icons, and empty state.

## Icon treatment

- Remove primary-tinted icon background containers from active home-dashboard content.
- Render the overview and activity icons with text-primary only.

## Verification

- Run formatting, typechecking, linting, and the production build.
- Confirm the project and activity layouts remain usable on narrow screens.
