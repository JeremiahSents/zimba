# Two-Step Project Creation

## Goal

Split project creation into a focused details step and a separate initial-allocation step. A project is persisted only after the user completes the allocation step.

## Routes and navigation

### Step 1: Project details

Route: `/admin/projects/new`

The page contains the existing project details form, upload area, and live preview. Remove the initial allocation table from this route. The page header keeps Cancel and replaces `Create project` with `Next`.

Selecting Next validates the required project fields. When validation succeeds, store the details and available preview metadata as a temporary browser-session draft, then navigate to `/admin/projects/new/allocation`. Invalid forms remain on the details page and show the existing inline error.

### Step 2: Initial allocation

Route: `/admin/projects/new/allocation`

The page contains a simplified allocation table with two data columns:

- Item name
- Initial allocation

Each row includes a remove action. An `Add item` action appends an empty row. The table footer displays the sum of all valid allocation values as the total project budget.

The page header contains Back and `Create project`. Back returns to the details route while preserving all entered details and allocation rows. Create project validates that the draft exists, every retained row has an item name, and the total allocation is greater than zero. It then persists the project using the allocation total as its budget, clears the temporary draft, and navigates to `/admin/projects`.

## Draft state

Use `sessionStorage` for the in-progress project draft so route navigation and refreshes within the same browser tab do not lose the form. The draft contains project details plus allocation rows. File objects cannot be serialized; the existing selected-file preview remains available during the current details-page render but is not restored after route navigation. This limitation does not affect persisted project data because attachments are not currently saved by the project store.

When Step 1 loads, restore serialized project details if a draft exists. Step 2 redirects to Step 1 when no valid details draft exists. Cancel clears the draft before returning to Projects. Successful creation also clears it.

## Components

- Keep `ProjectDetailsCard` and `ProjectPreviewCard` on Step 1.
- Introduce a focused draft-storage helper for reading, writing, and clearing the session draft.
- Add an allocation-page component responsible for row editing, validation, total calculation, and final persistence.
- Reuse allocation types and currency formatting where practical, but keep the Step 2 table visually and structurally simpler than the existing detailed allocation table.

## Responsive and accessibility behavior

The details and preview layout keeps its existing responsive stacking. The allocation table fits the page without horizontal scrolling: the item field receives the flexible width, the numeric allocation column has a constrained width, and the remove action stays compact. Every input and icon-only action has an accessible name. Focusable Back, Cancel, Next, and Create project actions retain clear disabled or error behavior.

## Verification

- Step 1 no longer renders allocation fields and Next opens the allocation route.
- Required detail validation prevents invalid navigation.
- Refreshing either step restores serializable draft data.
- Back preserves project details and allocation rows.
- Users can add and remove allocation rows.
- The footer total updates as allocation values change.
- Final creation uses the allocation total as budget and clears the draft.
- Direct access to Step 2 without details returns to Step 1.
- Formatting, type checking, linting, React Doctor, and browser checks pass.
