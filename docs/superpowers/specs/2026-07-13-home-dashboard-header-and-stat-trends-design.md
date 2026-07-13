# Home dashboard header and stat trends design

## Goal

Refine the home dashboard so its greeting lives in the header, its operational controls follow the reference layout, and its summary cards communicate a small directional trend.

## Header

- On the home dashboard only, replace the `Home` heading with `Good morning, Musa`.
- Keep the navigation toggle, notification control, and avatar unchanged.
- Remove the mock-data notice from the header. It is not displayed on the home dashboard or any other route.
- Other dashboard routes continue to show their existing titles in the header.

## Toolbar

- Place `Add expense` and `New project` at the left edge of the main content toolbar.
- Place a compact date-range display and a `Last 30 days` filter control at the right edge.
- The controls are presentational in this iteration: they do not change the loaded data.
- At narrow widths, the toolbar wraps while preserving actions before filters.

## Summary cards

- Preserve the four existing metrics: active projects, needs attention, total budget, and total spent.
- Add a compact month-over-month trend line below each metric value.
- Trends are fixed, presentational percentages until historical API data is available. Positive trends use the established positive colour; decreases use a subdued destructive colour.

## Implementation boundaries

- Update the dashboard shell API only enough to accept an optional home-header greeting.
- Update the home dashboard page to supply the greeting, toolbar, and stat trend metadata.
- Do not alter dashboard data fetching, routes, existing action destinations, or the behavior of the current controls.

## Verification

- Run the web app typecheck and lint.
- Confirm the dashboard builds and the home page remains usable at desktop and narrow widths.
