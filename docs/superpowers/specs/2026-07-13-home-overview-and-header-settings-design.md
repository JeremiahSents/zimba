# Home overview and header settings design

## Goal

Simplify the home dashboard toolbar and expose Settings as a compact global header action.

## Home dashboard

- Remove the `Add expense`, `New project`, date range, and duration controls from the home toolbar.
- Render `Overview` as the home dashboard's section heading above its summary cards.

## Global navigation

- Remove the Settings item from the dashboard sidebar footer.
- Add a compact accessible Settings icon button in the shared dashboard header directly after notifications and before the avatar.
- The header button links to the existing `/dashboard/settings` route.
- Keep Sign out in the sidebar and leave the Settings page and all routes unchanged.

## Verification

- Run the web app typecheck and lint.
- Verify the production build and header behavior at desktop and narrow widths.
