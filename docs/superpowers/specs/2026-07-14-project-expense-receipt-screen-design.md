# Project expense receipt screen

## Goal

Replace the project-detail New expense modal with a dedicated project-scoped receipt-entry screen inspired by an invoice item table.

## Route and navigation

- Add `/admin/projects/[id]/expenses/new`.
- The project-detail New expense action links to this route.
- The project is derived from the route and displayed as locked context rather than an editable project selector.
- Cancel returns to `/admin/projects/[id]`.
- Successful save persists the expense locally and returns to the project detail page.

## Receipt fields

- Supplier
- Expense date
- Project task
- Item details
- Quantity
- Rate
- Amount, calculated automatically as quantity multiplied by rate

The screen does not include tax, attachments, scanning, bulk actions, or multiple item rows.

## Layout

- Use the existing dashboard shell and project breadcrumb.
- Place receipt metadata above a single-line item table.
- Match the supplied reference's clear table hierarchy: Item details, Quantity, Rate, and Amount.
- Keep Quantity and Rate editable, Amount read-only and emphasized.
- Show the calculated receipt total below the table.
- Keep Cancel and Save expense actions visible at the bottom of the form.

## Data behavior

- Validate supplier, date, task, item details, positive quantity, and non-negative rate.
- Calculate the amount in the client and do not accept a manually entered total.
- Store locally created expenses under the project id because no expense mutation endpoint currently exists.
- Merge locally stored expenses into the project detail expense list so the new receipt appears after navigation.
- Store the calculated amount as the existing expense record's amount.

## Responsive behavior

- The metadata fields stack on narrow screens.
- The item table remains horizontally scrollable when needed.
- Primary actions remain reachable without relying on a modal.

## Verification

- Confirm New expense opens the new route instead of a dialog.
- Confirm the project is fixed from the route.
- Confirm quantity and rate recalculate the amount and receipt total.
- Confirm saving returns to the project and the new expense appears in its table.
- Run typecheck, lint, React Doctor, and browser verification at desktop and narrow widths.
