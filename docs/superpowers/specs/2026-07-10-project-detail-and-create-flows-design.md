# Project detail and create flows

## Goal

Add a real `/dashboard/projects/[id]` view matching the supplied Zimba reference, with budget/task tracking, task spend pie chart, utilisation tracking, expenses, suppliers, and usable create flows.

## Design

- The project list links each project to its detail route.
- Detail pages use the existing typed mock/API data boundary and render a responsive summary, donut chart, task progress list, utilisation card, expenses table, and suppliers.
- New expense and new project use the existing sheet primitive. Forms are client-side and update the visible mock page immediately; API wiring remains isolated for a later mutation endpoint.
- The visual system stays within the existing botanical dashboard palette and component primitives.

## Verification

Run workspace typecheck, lint, and production build after implementation.
