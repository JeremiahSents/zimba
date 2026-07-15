# Mobile-Responsive Dashboard Implementation Plan

**Design source:** `docs/superpowers/specs/2026-07-15-mobile-responsive-dashboard-design.md`

**Target application:** `apps/web`

**Framework baseline:** Next.js 16.2.6, React 19.2.4, Tailwind CSS 4, Base UI, TanStack Table 8

## Objective

Implement the approved mobile-responsive dashboard design across every authenticated admin route while preserving existing desktop behavior, API contracts, authentication, routing, mutations, uploads, draft persistence, filters, sorting, and pagination.

The implementation is complete only when all dashboard routes work at 320px without page-level horizontal scrolling, all essential controls meet the 44×44px touch-target requirement, and the desktop reference layouts remain intact.

## Guardrails

1. Read the relevant Next.js guides under `apps/web/node_modules/next/dist/docs/` before changing framework APIs or server/client boundaries. The initial implementation should follow the current guidance that pages/layouts remain Server Components and interactive navigation is isolated in small Client Components.
2. Do not turn `app/admin/layout.tsx` into a Client Component. Mount interactive mobile navigation below the existing server-rendered authentication and membership boundary.
3. Do not introduce a mobile-only data store. Mobile cards and desktop tables must use the same source data and interaction state.
4. Do not change API request/response types, server actions, Better Auth behavior, project draft storage, or upload semantics as part of responsive work.
5. Do not stage or overwrite unrelated worktree changes. `packages/ui/src/styles/globals.css` is already modified and must be reconciled carefully before responsive token work begins.
6. Avoid route-specific CSS when a shared shell, form, overlay, or data-view pattern can express the requirement.
7. No authenticated E2E test may bypass authentication. Automated protected-route tests require a real test user, separate test database, and CI-safe storage state.

## Standard Verification Gates

Run these gates after each task that changes application code:

```powershell
pnpm --filter @workspace/ui typecheck
pnpm --filter @workspace/ui lint
pnpm --filter web typecheck
pnpm --filter web lint
```

Run this broader gate after each phase and before release:

```powershell
pnpm --filter web build
```

Run React Doctor after React changes, following its installed skill instructions. Inspect the authenticated application in a browser at the task-specific widths listed below. A successful typecheck or build does not replace visual and interaction verification.

## Task 1: Establish the Baseline and Mobile Acceptance Matrix

**Priority:** P0

**Dependencies:** None

### Files

- Read: `apps/web/app/admin/**/*.tsx`
- Read: `apps/web/components/**/*.tsx`
- Read: `packages/ui/src/components/**/*.tsx`
- Create: `docs/mobile-dashboard-acceptance-matrix.md`
- Optional, only after test infrastructure approval: `apps/web/playwright.config.ts`
- Optional, only after test infrastructure approval: `apps/web/e2e/mobile-dashboard.spec.ts`

### Steps

1. Inventory every authenticated route and record its empty, loading, error, short-content, long-content, and populated states.
2. Capture desktop reference screenshots at 1024×768, 1280×800, and 1440×900.
3. Capture current mobile evidence at 320×568, 390×844, 767×1024, and 768×1024.
4. Record page-level overflow, clipped content, sub-44px controls, focus-order issues, keyboard collisions, and hover-only actions in the acceptance matrix.
5. Create representative long strings and large currency values for manual testing without changing production fixtures.
6. Confirm whether CI has a separate test database and authenticated test account.
7. If both exist, add Playwright as a web dev dependency, create a storage-state setup using the real test account, and add route smoke checks. If they do not exist, leave automated protected-route tests unconfigured and keep the full manual matrix release-blocking.
8. Do not add a test-only authentication bypass.

### Acceptance

- Every admin route has a recorded desktop baseline and mobile failure checklist.
- The 767/768 navigation boundary has explicit coverage.
- Test authentication capability is documented as available or unavailable.
- No product code changes are included in this task.

## Task 2: Add Responsive Tokens and Shell Spacing

**Priority:** P0

**Dependencies:** Task 1

### Files

- Modify carefully: `packages/ui/src/styles/globals.css`
- Modify: `apps/web/components/shared/dashboard-shell.tsx`
- Modify: `packages/ui/src/components/sidebar.tsx` only if an exposed shell hook is required
- Verify: `apps/web/app/admin/layout.tsx`

### Steps

1. Reconcile the existing uncommitted `globals.css` changes with the owner before editing overlapping lines.
2. Add shared CSS custom properties for mobile page gutter, compact section gap, mobile dock height, mobile dock offset, and safe-area bottom clearance.
3. Add reusable utility classes only when Tailwind composition would otherwise be repeated across many routes.
4. Update `DashboardShell` so mobile content uses 20–24px section spacing and desktop retains the current 32px rhythm.
5. Add mobile bottom padding equal to dock height, dock offset, safe-area inset, and 16px breathing room.
6. Add a `focusedTask` or equivalent explicit shell prop that disables dock padding and enables the focused form layout. Do not infer focused mode from arbitrary path substrings inside individual forms.
7. Keep footer content clear of the mobile dock.
8. Preserve `SidebarInset` and desktop sidebar layout at 768px and above.

### Browser verification

- Widths: 320, 390, 767, 768, 1024, 1440px.
- Confirm the shell itself never creates horizontal overflow.
- Confirm desktop content width and spacing match the baseline.

### Acceptance

- Shared tokens exist for all fixed mobile layers.
- Standard pages reserve dock space; focused pages do not reserve space for a hidden dock.
- Desktop layout remains visually unchanged.

## Task 3: Implement the Floating Mobile Navigation and More Sheet

**Priority:** P0

**Dependencies:** Task 2

### Files

- Create: `apps/web/components/shared/mobile-dashboard-nav.tsx`
- Create: `apps/web/components/shared/mobile-more-sheet.tsx`
- Modify: `apps/web/components/shared/dashboard-shell.tsx`
- Modify: `apps/web/components/shared/sidebar.tsx`
- Reuse: `packages/ui/src/components/sheet.tsx`
- Reuse: `packages/ui/src/components/button.tsx`

### Steps

1. Extract a single navigation definition shared by desktop sidebar and mobile dock. Include route match behavior rather than duplicating pathname logic.
2. Define primary mobile items in the approved order: Home, Projects, Suppliers, Team, Analytics, More.
3. Map nested project routes to Projects and nested supplier routes to Suppliers.
4. Map Reports, Expenses, Budget, and Settings to More.
5. Build `MobileDashboardNav` as a narrow Client Component using `usePathname`, `Link`, and Base UI Sheet state only where necessary.
6. Keep the authenticated server layout and fetched workspace data outside the new client boundary. Pass only serializable account display data to the More sheet.
7. Make every dock item at least 48px wide and 52px high at 320px. Use icon plus persistent non-wrapping label.
8. Implement the translucent surface, 16–20px blur, subtle border, radius, upper highlight, and restrained shadow.
9. Add an opaque fallback for unsupported backdrop filtering and reduced-transparency/high-contrast modes.
10. Add `aria-label` to the navigation landmark and `aria-current="page"` to the active link.
11. Build the More sheet with Reports, Expenses, Budget, Settings, Notifications, account context, and sign out.
12. Use 44px minimum rows, visible current-route state, safe-area padding, correct sheet title/description, focus trapping, and focus restoration.
13. Remove the mobile sidebar toggle and mobile settings icon from the topbar while leaving their desktop behavior intact.
14. Hide the dock when `DashboardShell` is in focused task mode.
15. Use opacity and transform transitions only; disable nonessential motion under `prefers-reduced-motion`.

### Browser verification

- Widths: 320, 360, 390, 412, 767, 768px.
- Navigate to every top-level and nested route using the dock and More sheet.
- Verify Back, Forward, reload, and deep links preserve correct active state.
- Verify no dock label wraps and no target falls below 44×44px.
- Verify VoiceOver/TalkBack reading order and keyboard focus restoration.

### Acceptance

- The dock mirrors the approved desktop hierarchy.
- More is active on Reports, Expenses, Budget, and Settings.
- No page content or footer is hidden by the dock.
- The desktop sidebar is unchanged.

## Task 4: Standardize Mobile Controls, Forms, and Overlays

**Priority:** P0

**Dependencies:** Tasks 2–3

### Files

- Modify: `packages/ui/src/components/button.tsx`
- Modify: `packages/ui/src/components/input.tsx`
- Modify: `packages/ui/src/components/select.tsx`
- Modify: `packages/ui/src/components/tabs.tsx`
- Modify as needed: `packages/ui/src/components/field.tsx`
- Modify: `apps/web/components/shared/date-picker.tsx`
- Modify: `apps/web/components/shared/calendar.tsx`
- Create: `apps/web/components/shared/form-error-summary.tsx`
- Create: `apps/web/components/shared/mobile-form-actions.tsx`
- Create: `apps/web/components/shared/form-section.tsx`

### Steps

1. Preserve existing desktop size variants. Add mobile-safe composition classes or explicit variants instead of globally inflating every desktop control.
2. Ensure essential mobile buttons, icon buttons, inputs, select triggers, tab/filter triggers, and date triggers have a 44–48px interactive box.
3. Use 16px mobile input text to prevent iOS zoom; retain the current desktop type scale at larger widths.
4. Standardize field labels, descriptions, optional/required indicators, errors, `aria-invalid`, and `aria-describedby` through the existing Field primitives.
5. Add `FormErrorSummary` with a focusable alert region and field references.
6. Add `FormSection` for visible semantic grouping with `fieldset` and `legend` where appropriate.
7. Add `MobileFormActions` with safe-area handling, solid/opaque background, primary-action emphasis, and keyboard-safe behavior.
8. Rework the date picker so compact mobile widths use a dialog or bottom sheet. Keep a collision-aware popover for tablet/desktop.
9. Make every calendar day target at least 44px and announce selected date and month changes.
10. For long select option sets, support a mobile sheet presentation without changing the Select value contract.
11. Make tab/filter rails independently scrollable when necessary; the page itself must remain fixed horizontally.

### Verification

- Test controls in light and dark themes.
- Test keyboard-only operation, VoiceOver, TalkBack, 200% zoom, reduced motion, and increased contrast.
- Open the date picker at the top and bottom of a 320×568 viewport with and without the keyboard visible.

### Acceptance

- Essential mobile controls meet the touch-target requirement.
- Form controls do not trigger unwanted iOS zoom.
- Overlay focus behavior is correct and no overlay extends beyond the viewport.
- Desktop control dimensions remain consistent with the baseline.

## Task 5: Create the Shared Responsive Data-View Pattern

**Priority:** P0

**Dependencies:** Task 4

### Files

- Create: `apps/web/components/shared/responsive-data-view.tsx`
- Create: `apps/web/components/shared/mobile-data-card.tsx`
- Modify only if needed: `packages/ui/src/components/table.tsx`
- Reference: existing TanStack table components in `apps/web/components/**`

### Steps

1. Create a presentation boundary that renders a semantic mobile list below 768px and the existing table at 768px and above.
2. Accept already-derived row data or TanStack row models; do not create a second filter/sort/pagination pipeline.
3. Keep both presentations keyed by stable domain or TanStack row IDs.
4. Create a shared mobile card shell with named primary, metadata, status, amount, actions, and expandable-detail slots.
5. Use a real button for expansion with `aria-expanded` and an associated details region.
6. Provide a visible 44px row-action trigger; do not depend on row hover.
7. Preserve result count, active filters, pagination position, empty states, and mutation feedback across both presentations.
8. Render both state-free presentations from the same already-derived page of rows and switch visibility with responsive classes. Keep filtering, sorting, pagination, expansion identity, and mutations in their existing parent so the hidden presentation owns no duplicate state. This produces deterministic server HTML and avoids a hydration-time layout swap.
9. Keep page sizes bounded so rendering both presentation shells does not create significant work. If measurement later proves a specific view expensive, optimize that view only after preserving deterministic server output and state continuity.
10. Keep the table primitive's horizontal scroll behavior for genuine desktop overflow, but remove reliance on it for 320–767px dashboard data.

### Verification

- Use one representative expense dataset to prove filtering, sorting, pagination, expansion, and status actions work in both modes.
- Resize across 767/768px and confirm state is preserved.
- Confirm semantic list reading order on mobile and table semantics on desktop.

### Acceptance

- One state pipeline drives both presentations.
- Presentation switching does not reset filters, page index, expansion-relevant identity, or mutations.
- No primary dashboard data set requires page-level horizontal scrolling.

## Task 6: Redesign Home and Projects List

**Priority:** P0

**Dependencies:** Task 5

### Files

- Modify: `apps/web/components/dashboard/overview-page.tsx`
- Modify: `apps/web/components/dashboard/recent-activity.tsx`
- Modify: `apps/web/components/dashboard/projects-section.tsx`
- Modify: `apps/web/components/projects/projects-page.tsx`
- Verify/remove if unused: `apps/web/components/projects/projects-table.tsx`

### Steps

1. Make Home and Projects page headers stack actions at compact widths without shrinking controls.
2. Implement compact metric grids; let the dominant total span both columns when necessary.
3. Preserve the existing project cards, status treatment, progress, links, empty state, and pagination.
4. Replace the Home six-column recent-activity table with mobile transaction cards while keeping the desktop table.
5. Show item/project, amount, and status first; move task, supplier, and date into secondary metadata.
6. Remove 9px essential text from the mobile presentation.
7. Make Projects search full width on compact screens and maintain its current filter and page-reset semantics.
8. Make pagination controls full width at compact mobile sizes and keep the page count announced.
9. Reduce unnecessary fixed empty-state height on short screens without changing its desktop appearance.

### Verification

- Home: empty data, one project, multiple projects, no activity, and four activity rows.
- Projects: zero results, one result, more than one page, long project/location/client names.
- Widths: 320, 390, 640, 767, 768, 1024, 1440px.

### Acceptance

- Home and Projects have no page-level horizontal overflow.
- Recent activity is readable without side-scrolling.
- Existing filters, links, empty states, and pagination behavior remain intact.

## Task 7: Redesign Expenses and Supplier List Data Views

**Priority:** P0

**Dependencies:** Task 5

### Files

- Modify: `apps/web/components/expenses/expenses-page.tsx`
- Modify: `apps/web/components/shared/expense-table.tsx`
- Modify: `apps/web/components/suppliers/suppliers-page.tsx`
- Modify: `apps/web/components/suppliers/supplier-table.tsx`

### Steps

1. Convert Expense filters into 44px chips in an independently scrollable rail.
2. Use a compact expense metric layout with the current values and labels.
3. Add mobile expense cards driven by the existing TanStack table instance.
4. Keep item, amount, project, and status visible; expose supplier, task, date, sorting, and actions in expanded/details UI.
5. Preserve global search, sorting, pagination, and empty messages.
6. Convert the Suppliers four-metric strip into a readable 2×2 mobile layout.
7. Stack category and payment filters at compact widths.
8. Add supplier cards driven by the same filtered and sorted rows as the desktop table.
9. Keep supplier, category, and remaining balance prominent; expose receipt value, paid value, and profile action without hover.

### Verification

- Expenses: empty, one, five, and more-than-five results; all filter chips; long item and supplier strings; large currency.
- Suppliers: every category and payment filter, search, sort, long company names, zero balance, and outstanding balance.
- Confirm filters and pagination survive 767/768px changes.

### Acceptance

- Expenses and Suppliers require no mobile horizontal scrolling.
- All desktop table capabilities remain available on mobile.
- Supplier profile and expense actions remain reachable with 44px targets.

## Task 8: Redesign Project and Supplier Detail Pages

**Priority:** P0

**Dependencies:** Tasks 5–7

### Files

- Modify: `apps/web/components/projects/project-detail-page.tsx`
- Modify: `apps/web/components/projects/project-expenses-table.tsx`
- Modify: `apps/web/components/suppliers/supplier-detail-page.tsx`

### Steps

1. Reorder Project detail mobile sections to Budget, Tasks, Payments, and Expenses while preserving desktop order if changing it would alter the approved baseline.
2. Use a compact two-column metric layout and stack budget/chart panels.
3. Preserve task expansion behavior and make the full task header a 44px target.
4. Convert project expenses to expandable cards with status-change actions and shared table state.
5. Ensure upcoming payment actions work without hover and wrap safely.
6. Stack Supplier identity and contact surfaces; allow long contact details to wrap.
7. Use readable mobile financial metrics and retain payment distribution information.
8. Replace the 560px supplier history table with receipt/payment cards while retaining the desktop table.
9. Keep receipt, amount, and status visible; reveal date, project, and remaining balance in details.

### Verification

- Project detail with no tasks, multiple tasks, expanded task, no expenses, many expenses, no upcoming payments, and multiple upcoming payments.
- Supplier detail with long contacts, multiple categories, no receipts, and mixed payment statuses.
- Exercise project expense status mutations in both responsive presentations.

### Acceptance

- Both detail routes work at 320px without clipped charts, metrics, actions, or data.
- All existing mutations and expansion behavior remain intact.
- Desktop detail composition matches its baseline.

## Task 9: Convert New Project, New Project Expense, and Supplier Creation to Focused Mobile Tasks

**Priority:** P0

**Dependencies:** Task 4

### Files

- Modify: `apps/web/components/projects/project-create-page.tsx`
- Modify: `apps/web/components/projects/project-details-card.tsx`
- Modify: `apps/web/components/projects/project-preview-card.tsx`
- Modify: `apps/web/components/projects/project-allocation-create-page.tsx`
- Modify or reuse: `apps/web/components/projects/allocation-table.tsx`
- Modify: `apps/web/components/projects/project-expense-create-page.tsx`
- Modify: `apps/web/components/projects/upload-zone.tsx`
- Modify: `apps/web/components/suppliers/new-supplier-page.tsx`
- Modify: `apps/web/components/suppliers/supplier-form.tsx`

### Steps

1. Pass focused task mode to `DashboardShell` for every create route.
2. Add a compact back header, step indicator where applicable, and sticky actions.
3. Group Project details into identity, location/type, and attachment sections.
4. Collapse the Project preview behind a labeled disclosure on mobile; keep it visible/sticky on desktop.
5. Preserve draft reads/writes, attachment upload, validation, and step navigation.
6. Render allocation rows as editable mobile cards using the same row state and total calculation as the desktop table.
7. Keep item name, formatted amount, remove action, validation, and running total accessible.
8. Replace the expense-entry 880px grid with expandable line-item cards on mobile.
9. Preserve item IDs, project binding, task/supplier selections, quantity/unit-cost calculation, uploads, API status normalization, and submission payload.
10. Keep item description and computed amount in the collapsed summary; place all editable fields in the expanded region.
11. Group Supplier fields into Company and Contact sections and add `FormErrorSummary` plus inline errors.
12. Improve `UploadZone` with a prominent Choose files action and explicit file progress/failure/retry/remove state; retain desktop drag-and-drop.
13. Test sticky actions with the keyboard, date sheet, select sheet, and file chooser.

### Verification

- New project: empty submit, valid details, file upload success/failure, draft restoration, forward/back between steps, allocation edits, removal, and final submission.
- New expense: add/remove multiple line items, every select, date selection, receipt upload success/failure, total calculation, validation, and submission error.
- New supplier: every invalid field, error-summary links, successful save, and cancel.
- Widths: 320×568, 390×844, 640×960, 767×1024, 768×1024, and desktop.

### Acceptance

- Create flows never display the full dock and sticky actions simultaneously.
- The mobile keyboard does not make the primary action unreachable.
- Existing drafts, uploads, calculations, routing, and submissions produce identical results.

## Task 10: Redesign Team, Analytics, Reports, Budget, and Settings

**Priority:** P1

**Dependencies:** Tasks 4–5

### Files

- Modify: `apps/web/components/team/team-page.tsx`
- Modify: `apps/web/components/team/team-table.tsx`
- Modify: `apps/web/components/analytics/analytics-page.tsx`
- Modify: `apps/web/components/dashboard/spend-bar-chart.tsx`
- Modify: `apps/web/components/dashboard/utilization-area-chart.tsx`
- Modify: `apps/web/components/reports/reports-page.tsx`
- Modify: `apps/web/components/reports/reports-table.tsx`
- Modify: `apps/web/components/budget/budget-page.tsx`
- Modify: `apps/web/components/budget/project-budget-table.tsx`
- Modify: `apps/web/components/settings/settings-page.tsx`
- Modify as needed: `apps/web/components/shared/activity-row.tsx`
- Modify as needed: `apps/web/components/shared/setting-field.tsx`

### Steps

1. Stack Team heading/action and render member cards with role, responsibility, status, and actions.
2. Preserve Team filtering, sorting, and pagination from the existing table instance.
3. Stack Analytics charts, keep summary metrics compact, and reuse mobile expense cards.
4. Ensure chart legends, tooltips, and summaries are available to touch, keyboard, and assistive technology.
5. Render Reports as project report cards with budget, remaining amount, utilization, and export action.
6. Preserve bulk report export placement.
7. Feature the overall Budget total and render project budgets as progress cards using existing data.
8. Stack Settings sections, use 52px minimum setting rows, allow values/actions to wrap, and place Role access after notifications.
9. Preserve all mock/API values and existing action behavior.

### Verification

- Test zero, one, and many rows on Team, Reports, and Budget.
- Test Analytics with empty and dense chart series, touch tooltips, keyboard navigation, and large values.
- Test Settings with long company/region strings and 200%/400% zoom.

### Acceptance

- Every secondary route has an intentional mobile layout.
- Charts and data remain understandable without desktop-only hover.
- Desktop tables and layouts remain visually consistent.

## Task 11: Finish Notifications, Loading Feedback, and Navigation Performance

**Priority:** P1

**Dependencies:** Tasks 3 and 10

### Files

- Modify: `apps/web/components/shared/dashboard-shell.tsx`
- Modify: `apps/web/components/shared/mobile-more-sheet.tsx`
- Consider creating: `apps/web/app/admin/loading.tsx`
- Read before adding loading UI: `apps/web/node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`

### Steps

1. Present notifications as a bottom or near-full-height mobile sheet while preserving the desktop side sheet.
2. Stack description, due date, and amount; retain unread indicator, add action, and empty state.
3. Verify notification and More sheets do not open simultaneously.
4. Assess dynamic-route transition latency with authenticated production-like data.
5. If navigation lacks immediate feedback, add an admin `loading.tsx` skeleton that preserves the shell and dock rather than converting server pages to clients.
6. Keep navigation links as `Link` so Next.js prefetching and client transitions remain available.
7. Avoid eager-loading heavy sheet contents or charts into the shared shell.
8. Confirm dock mount causes no visible layout shift.

### Acceptance

- Notifications are readable and operable at 320px.
- Overlay focus and mutual exclusion are correct.
- Navigation provides immediate feedback without expanding the client component boundary unnecessarily.

## Task 12: Accessibility, Performance, and Release Audit

**Priority:** P0 release gate

**Dependencies:** Tasks 1–11

### Files

- Update: `docs/mobile-dashboard-acceptance-matrix.md`
- Modify product files only when a failed audit identifies a defect

### Steps

1. Run the standard lint, typecheck, build, and React Doctor gates.
2. Test every route at 320×568, 360×800, 375×812, 390×844, 412×915, 480×800, 640×960, 767×1024, 768×1024, 820×1180, 1024×768, 1280×800, and 1440×900.
3. Test iPhone Safari, iPhone standalone/PWA, Android Chrome on mid-range hardware, Samsung Internet, iPad Safari portrait/landscape, and desktop Chrome/Firefox/Safari/Edge.
4. Verify keyboard-only operation, VoiceOver, TalkBack, 200% and 400% zoom/reflow, visible focus, headings, landmarks, labels, descriptions, and focus restoration.
5. Confirm 4.5:1 text contrast and 3:1 control/non-text contrast, including the glass dock over every page background.
6. Verify reduced motion, increased contrast, and reduced transparency.
7. Confirm all essential targets are at least 44×44px.
8. Exercise empty, error, long-string, large-currency, and large-dataset fixtures.
9. Verify filter, sort, pagination, expansion, row actions, status mutations, drafts, uploads, and submissions across the 767/768 boundary.
10. Compare desktop screenshots with Task 1 baselines and investigate every unintended difference.
11. Measure layout stability and interaction responsiveness. Target CLS below 0.1 and INP below 200ms on representative mobile hardware.
12. Confirm only the filter rail, not the page, scrolls horizontally on mobile.
13. Confirm no content is hidden by the dock, keyboard, sheets, sticky actions, or safe areas.

### Final acceptance

- Every requirement and route in the approved design specification is marked passed in the acceptance matrix.
- The full verification commands pass.
- Mobile has no page-level horizontal overflow at 320px.
- Desktop behavior is preserved.
- No API, authentication, routing, mutation, upload, filtering, sorting, pagination, or draft behavior regresses.

## Recommended Commit Sequence

1. `docs: add mobile dashboard acceptance matrix`
2. `feat: add responsive dashboard shell tokens`
3. `feat: add mobile dashboard navigation`
4. `feat: standardize mobile form controls`
5. `feat: add responsive data view primitives`
6. `feat: redesign home and projects for mobile`
7. `feat: redesign expenses and suppliers for mobile`
8. `feat: redesign project and supplier details for mobile`
9. `feat: redesign dashboard creation flows for mobile`
10. `feat: redesign secondary dashboard pages for mobile`
11. `feat: improve mobile notifications and route feedback`
12. `test: complete mobile dashboard release audit`

Each commit must pass the standard verification gates and contain only the task's files. Do not combine unrelated user changes with responsive-dashboard commits.
