# Project detail metric and expense polish

## Goal

Simplify the project-detail financial summary and improve scanability without changing the page's data flow or interactive expense workflow.

## Summary metrics

- Keep three cards: Total budget, Total spent, and Remaining budget.
- Remove the separate Utilization card.
- Remove the Baseline badge from Total budget.
- Show the project's utilization percentage on Total spent instead of the Spent badge.
- Keep the remaining-percentage badge on Remaining budget.
- Remove the Share action while retaining New expense.

## Progress direction

- Budget health represents percentage used, not percentage remaining.
- The budget-health progress bar fills from left to right using the utilization value.
- Every task progress bar fills from left to right using that task's spent-to-budget percentage.
- Existing health colors and status thresholds remain unchanged.

## Expense presentation

- Keep the searchable, sortable, paginated expense table.
- Remove only the Expenses card's outer rounded border and card surface.
- Keep the Expenses heading, description, search, count, table, and pagination.
- Render task and supplier as differentiated plain text rather than adjacent pills.
- Strengthen the primary typography for expense items and amounts while keeping dates and supplier metadata quieter.

## Scope

This is a focused presentation change in the existing project-detail client components. It does not change routes, API behavior, calculations, dialogs, persistence, or the payment-notification card.

## Responsive behavior

- Summary cards use one column on small screens, two on medium screens, and three on large screens.
- The expense section retains its existing responsive search and pagination behavior.
- Progress direction remains left to right at every breakpoint.

## Verification

- Run the web app typecheck and lint checks.
- Run React Doctor because React components are changing.
- Inspect the project-detail page in the browser at desktop and narrow widths.
- Confirm there is no Share button, no Utilization card, no Baseline or Spent badge, and no outer card around the expense table.
- Confirm budget and task progress bars visually fill left to right.
