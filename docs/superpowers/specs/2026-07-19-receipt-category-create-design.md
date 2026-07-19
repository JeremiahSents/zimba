# Receipt Category Creation Design

## Goal

Allow a user entering a project receipt to create a new receipt line category directly from the category dropdown. In this app, receipt line categories are project tasks/allocations, so the new category must be saved as a real project allocation with its own budget.

## Current Behavior

The receipt form at `apps/web/components/projects/project-expense-create-page.tsx` renders each line category from `project.tasks`. Each saved receipt line sends an `allocation_id` to `createPayableExpenseAction`, and the server validates that the allocation belongs to the active project.

Project budgets are computed from the sum of allocations. Creating a new allocation with a positive budget therefore increases the overall project budget through the existing project detail/list calculations.

## Proposed Behavior

Add a `+ Create new category` option to the category dropdown for each receipt line. When selected, open a modal with:

- Category name
- Budget

Submitting the modal creates a project allocation for the current project, appends it to the receipt form's local category list, and selects it for the line that opened the modal. The user stays in the receipt workflow and can save the receipt normally.

## Architecture

Reuse the existing server mutation path for project allocations:

- `createProjectTaskAction(projectId, { name, budget })` remains the server action entry point.
- Adjust that action to return the created allocation's `id`, `name`, `budget`, `spent`, and `pct` so the client can immediately select it without waiting on a full route refresh.
- Ensure the mutation still revalidates connected routes so project totals, dashboard views, reports, and budget pages reflect the increased budget after navigation or refresh.

On the client, keep a local `categories` state initialized from `project.tasks`. Use it for both mobile and desktop category selects. Track the line id that requested category creation, and update that line's `allocationId` after the create action succeeds.

## UI Flow

1. User opens the category dropdown on a receipt line.
2. User chooses `+ Create new category`.
3. The dropdown closes and a modal opens.
4. User enters a category name and budget.
5. On success, the modal closes, the new category appears in the dropdown data, and the triggering receipt line uses it.

Validation should match the existing project task rule: name must be non-empty and budget must be greater than zero.

## Error Handling

Show action failures inside the modal using the existing `ErrorNotice` component. Disable modal submit while the create action is pending. Preserve the receipt draft and existing line values if creation fails.

## Testing

Add or update focused tests around the project task server action return value if existing test structure supports it. Run the relevant web checks after implementation, at minimum TypeScript/lint or the closest package script available, and any targeted tests for project mutations/actions.

## Out Of Scope

This change does not add free-text receipt categories that are not project allocations. It does not redesign project budgeting or change receipt line persistence. It also does not require users to leave the receipt form to manage project tasks.
