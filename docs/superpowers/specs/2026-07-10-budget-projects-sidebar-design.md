# Budget and Projects Navigation Design

## Goal

Extend the dashboard sidebar with a clear `Overview` section and add two usable dashboard areas: Budget and Projects.

## Scope

- Add an `Overview` label above the primary dashboard navigation.
- Add Budget and Projects links under Overview.
- Add `/dashboard/budget` and `/dashboard/projects` routes.
- Use the existing dashboard shell, UI primitives, typography, color tokens, spacing, and mock-data conventions.
- Keep the first release mock-backed and responsive; persistence and creation/edit dialogs are out of scope.

## Navigation

The expanded sidebar will show:

1. Overview
2. Dashboard
3. Budget
4. Projects
5. Expenses
6. Suppliers
7. Team
8. Reports

Budget and Projects use route-aware active states consistent with the existing navigation. Settings and the signed-in user remain in the footer.

## Budget page

The page will provide an initial budget-management overview:

- Page heading and short explanatory description.
- Summary cards for total budget, committed/spent amount, and remaining amount.
- Overall progress visualization.
- Project budget table with project name, allocated budget, spent amount, remaining amount, and progress.
- A clear setup-budget action affordance presented as a non-persistent UI control where the existing app has no budget persistence yet.

## Projects page

The page will provide a portfolio overview:

- Page heading and short explanatory description.
- Summary cards for total projects, active projects, and total project value.
- Project list/table with project name, client, status, timeline, budget, and spend.
- Responsive layout that remains readable in the collapsed sidebar and smaller viewports.

## Components and data

Prefer small feature components under `apps/web/components/dashboard/features/budget` and `.../projects`, with route files delegating to those components. Add focused mock records to the existing Zimba mock-data layer only where needed. Reuse shared cards, badges, progress indicators, and table primitives rather than creating parallel UI primitives.

## Acceptance criteria

- Sidebar displays the Overview label and both new links.
- Each link navigates to a working page without a 404.
- Active styling is correct for each new route and its nested paths.
- Budget and Projects pages match the existing dashboard visual language and are responsive.
- Existing dashboard sections, footer links, and unrelated user changes remain intact.
- Typecheck and lint pass for the web app.
