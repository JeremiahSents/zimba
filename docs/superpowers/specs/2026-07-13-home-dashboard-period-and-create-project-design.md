# Home dashboard period and create-project controls design

## Goal

Replace the static dashboard period label with a clear period selector and a single primary project-creation action.

## Controls

- Replace `Last 30 days` with the existing shared select component.
- Offer `Last 7 days` and `Last 30 days`, with the latter selected initially.
- Place the select and a primary `Create project` button together at the right of the Overview heading.
- The button links to the existing `/dashboard/projects/new` route.

## Behavior

- The selection updates the visible selected label only in this iteration.
- Dashboard metrics and lists remain unchanged because period-aware data is not yet available from the API.
- Controls wrap cleanly below the Overview heading on narrow screens.

## Verification

- Run formatting, typechecking, linting, and production build verification.
