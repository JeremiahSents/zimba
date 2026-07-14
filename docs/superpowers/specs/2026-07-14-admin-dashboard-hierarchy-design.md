# Admin dashboard hierarchy refinement design

## Goal

Improve the Zimba admin dashboard hierarchy and scanning speed while preserving its current design system, routes, responsive behavior, and data-loading patterns. The work is limited to the shared sidebar and header controls plus the admin home page summary, active-projects section, and recent-expenses table.

## Sidebar and account context

- Keep the brand area limited to the Zimba logo and the product name `Zimba`.
- Render navigation labels at a medium weight without changing icon alignment, active states, hover states, tooltips, or collapsed behavior.
- Render the section label exactly as `Overview` in sentence case, without tracking, at a semibold weight that remains quieter than the navigation labels.
- Replace the standalone sidebar sign-out item with a compact tenant card above the footer boundary. The expanded card shows `Zimba Consultants` and `Admin`; the collapsed card uses an abbreviated visual with an accessible tooltip.
- Turn the existing header avatar into a keyboard-accessible account-menu trigger. The menu contains a `Sign out` action that keeps the existing navigation behavior to `/login`.

The current application has no live user or tenant object available to these client components. The tenant name and role therefore use the approved existing static context until real account data is introduced in a separate task.

## Home toolbar and summary

- Remove the period selector, its state, and the existing Create project action from the home toolbar.
- Add one primary `Add expense` action linking to `/admin/expenses`. This is intentional because the application has no expense-creation flow to invoke and no new workflow is in scope.
- Show exactly three independently bordered compact cards: Active projects, Total budget, and Total spent.
- Retain the current calculated values and icons, but remove trend pills, comparison copy, and the Needs attention metric.
- Preserve responsive stacking by using the existing grid breakpoints with three independent card items.

## Active projects

- Preserve the section-level View all action and each project's name, location, plot size, health label, utilization value, and budget figures.
- Remove the trailing View project action. The existing project-name link remains the row's navigation affordance.
- Keep the current green, amber, and red budget thresholds.
- Render the utilization fill from right to left while keeping the percentage and budget-health text visible for non-color understanding.
- Adjust the desktop grid after removing the third action column and retain a single-column mobile layout.

## Recent expenses

Render the table columns in this exact order:

1. Project name
2. Expense name
3. Supplier
4. Category
5. Date
6. Status

The existing expense task name supplies Category, and dates use the application's existing formatter. Amount and all other columns are omitted. The dashboard expense type is extended so each row supplies one of `Partial`, `Full`, or `Not paid`. Mock and derived API dashboard data is updated at its current mapping boundary so the UI does not invent missing values while rendering.

Status treatments use restrained labeled badges with distinct text and border/background treatments so meaning does not depend on color alone. The existing View expenses and View more navigation behavior remains unchanged, and horizontal overflow preserves usability at narrow widths.

## Component boundaries

- `components/shared/sidebar.tsx`: navigation hierarchy, brand simplification, and tenant card.
- `components/shared/dashboard-shell.tsx`: accessible avatar account menu and relocated sign-out.
- `components/dashboard/overview-page.tsx`: toolbar and compact summary cards.
- `components/dashboard/projects-section.tsx`: row layout and right-origin progress treatment.
- `components/dashboard/recent-activity.tsx`: six-column expense table.
- Existing dashboard data/type modules: explicit payment state and complete table fields.

No unrelated page redesign, route change, authentication change, new UI library, or new expense workflow is included.

## Accessibility and responsive behavior

- Retain visible focus styles and semantic links/buttons.
- Give the avatar menu and collapsed tenant representation explicit accessible labels or tooltip text.
- Use text labels in addition to color for project health and payment state.
- Keep the sidebar's mobile and icon-collapsed behavior intact.
- Allow the six-column table to scroll horizontally rather than compressing content below readable density.

## Verification

- Run formatting/lint checks, TypeScript checks, React Doctor, and the production build.
- Verify the admin home page at desktop and narrow/mobile widths.
- Confirm keyboard operation and focus visibility for the profile menu, sign-out action, sidebar links, and collapsed tenant tooltip.
- Confirm the Add expense action reaches `/admin/expenses`, project links remain functional, and no unrelated routes or business behavior change.
