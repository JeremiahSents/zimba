# Mobile-Responsive Dashboard Design

**Date:** 2026-07-15

**Status:** Approved

**Scope:** All authenticated admin dashboard routes and shared dashboard UI

## 1. Mobile UX Audit

### Current architecture

The dashboard is a Next.js admin application with a shared `DashboardShell`, a reusable sidebar, shared form controls, and TanStack-powered tables. The existing desktop experience is the baseline and must remain intact at desktop widths.

The current implementation already includes useful responsive foundations:

- The shared sidebar becomes an 18rem sheet below 768px.
- Dashboard content uses responsive horizontal padding.
- Most card grids collapse to a single column.
- Tables share filtering, sorting, and pagination logic.
- The project-creation flow is already divided into details and allocation steps.

### Confirmed mobile issues

1. **Navigation:** Mobile users must repeatedly reach for a top-left menu trigger. There is no persistent, one-handed navigation surface.
2. **Navigation coverage:** Expenses, Budget, and Settings are secondary paths rather than first-class desktop sidebar items.
3. **Touch targets:** Several icon controls, tabs, pagination controls, and small buttons are 32–40px high. Essential mobile targets must be at least 44×44px.
4. **Shell spacing:** The shared shell uses a 32px section gap on all widths and reserves no space for a floating bottom navigation dock.
5. **Topbar density:** The title, menu trigger, notifications, settings, and account controls can wrap or compete for width on narrow screens.
6. **Tables:** The shared table primitive defaults to horizontal scrolling. Several tables have four to seven columns and depend on side-scrolling on mobile.
7. **Compressed data:** The home activity table forces six columns into a fixed-width layout and uses text as small as 9px. The project expense table suppresses horizontal overflow while retaining six columns.
8. **Editable grids:** Project allocation uses fixed table columns. Expense entry explicitly renders an 880px-wide, seven-column grid.
9. **Forms:** Inputs are generally 40px high and use 14px text. Long forms lack a shared sticky mobile action pattern and robust error-summary behavior.
10. **Date selection:** The custom date picker uses fixed positioning and can collide with narrow viewport edges, the mobile keyboard, or the bottom dock.
11. **Filters and tabs:** Filter groups can become crowded and are not consistently scrollable or touch-sized.
12. **Long pages:** One-column metric stacks create unnecessary vertical length on Home, Projects, Budget, Suppliers, Team, and Reports.

### Route-level audit checklist

Every dashboard route must be checked in empty, loading, error, partial-data, and populated states. A route passes the mobile audit when:

- No page-level horizontal overflow exists at 320px.
- Essential text is at least 12px and remains readable at 200% zoom.
- Body copy and form controls do not require pinch zoom.
- Interactive controls have a minimum 44×44px target.
- Page content clears the floating navbar and the device safe area.
- Headers and action groups wrap without overlap.
- Cards do not clip enlarged or translated text.
- Charts preserve readable axes, labels, legends, and tooltips.
- The on-screen keyboard does not hide the focused field or primary action.
- Row actions are available without hover.
- Focus order follows the visual reading order.
- Desktop composition remains unchanged at 1024px and above.

## 2. Design Direction

### Chosen approach

Use progressive mobile adaptation within the existing component tree. Do not create separate mobile pages or duplicate business logic. Desktop tables and mobile card lists must consume the same data, filtering, sorting, pagination, and mutation state.

The mobile navigation will mirror the current desktop hierarchy, as approved:

1. Home
2. Projects
3. Suppliers
4. Team
5. Analytics
6. More

`More` contains Reports and the secondary destinations Expenses, Budget, and Settings, plus account-level actions.

### Responsive ranges

| Range | Intended behavior |
| --- | --- |
| 320–479px | Compact mobile; single-column content and the most condensed dock spacing |
| 480–639px | Large mobile; selected two-column metric layouts |
| 640–767px | Wide mobile; paired fields and expanded filter layouts where space allows |
| 768–1023px | Tablet; existing sidebar model, generally in its compact form |
| 1024px and above | Preserve the current desktop composition |

The functional mobile boundary remains 768px because the shared sidebar and mobile hooks already use that value.

### Layout rules

- Use 16px page gutters by default and allow 12px at 320px where required.
- Use 20–24px vertical section spacing on mobile; retain 32px at desktop widths.
- Use 16px card padding on mobile and 20–24px on larger screens.
- Stack page headings and primary actions when they cannot fit without reducing target size.
- Allow selected metric cards to use two columns when each card remains readable; an important total may span both columns.
- Remove fixed content widths below 768px.
- Apply `min-width: 0`, wrapping, and intentional truncation to all flex and grid children.
- Reserve bottom content padding equal to the dock height, dock offset, device safe-area inset, and 16px breathing room.
- Keep full-width primary buttons for forms and strong empty states; ordinary page actions should size to content when space allows.

### Brand and visual consistency

Retain the existing green primary color, neutral surfaces, Geist headings, Inter body typography, restrained borders, progress treatments, and status palette. Glassmorphism is reserved primarily for the mobile dock and temporary overlays. Broad use of blur would weaken the existing visual language and increase rendering cost.

## 3. Floating Glass Navbar Plan

### Structure

The floating dock appears below 768px and contains six destinations:

- Home
- Projects
- Suppliers
- Team
- Analytics
- More

Each item uses a persistent icon and 10–11px label. Labels never wrap. The complete item target remains at least 48px wide and 52px high, including at 320px.

The dock is fixed, horizontally centered, and constrained as follows:

- 8px side inset at 320px; 12px at 360px and wider.
- Maximum width of approximately 440px.
- Height of approximately 68–72px.
- Bottom offset of `max(8px, env(safe-area-inset-bottom))`.
- Rounded outer radius of approximately 18–22px.

### More sheet

Selecting More opens a bottom sheet containing:

- Reports
- Expenses
- Budget
- Settings
- Notifications
- Organization and account information
- Sign out

The sheet uses large list rows, visible labels, safe-area padding, focus trapping, and focus restoration. It is not a second nested sidebar. Reports and secondary destinations are presented as a compact list with current-route indication.

### Visual treatment

- Use the dashboard background at approximately 78–88% opacity.
- Apply 16–20px backdrop blur with mild saturation.
- Add a one-pixel translucent border and subtle upper highlight.
- Use a soft elevation shadow without a large dark halo.
- Provide an opaque surface fallback when backdrop filtering is unsupported.
- Increase opacity or disable translucency for reduced-transparency and high-contrast preferences.
- Keep a single active backdrop-filter layer during ordinary navigation.

### Active, pressed, and focus states

- The active item receives a soft primary-colored capsule, primary icon, and stronger label.
- Add `aria-current="page"` to the active destination.
- Project detail, creation, allocation, and project-expense routes keep Projects active.
- Supplier detail and supplier creation routes keep Suppliers active.
- Reports, Expenses, Budget, and Settings mark More active.
- Pressed feedback uses color rather than scale.
- Each item has an independent visible focus ring.
- Motion uses opacity and transform only and respects `prefers-reduced-motion`.

### Mobile topbar

Once the bottom dock is active, remove the mobile sidebar toggle. The mobile topbar retains the page title, notification control, and account avatar. Settings moves into More. The topbar remains compact, readable, and no shorter than its touch targets.

### Focused task mode

Hide the full dock on long create/edit routes:

- New project details
- New project allocation
- New project expense
- New supplier
- Future edit routes

These routes use a compact back header and a sticky form-action surface. This prevents the keyboard, dock, and submit controls from competing for the same space. Completing or cancelling the task returns the user to a standard route where the dock reappears.

## 4. Page Redesign Strategy

### Home

- Stack the section heading above its actions when necessary.
- Use compact mobile summary cards; allow the primary financial total to span both columns.
- Preserve the existing project-card list and progress treatment.
- Replace the six-column recent-activity table with transaction cards showing project/item, amount, status, task, supplier, and date in a clear hierarchy.
- Preserve the existing empty state while reducing unnecessary fixed height on short screens.

### Projects list

- Use a compact two-column summary layout where values remain readable.
- Keep the existing project cards as the mobile source of truth.
- Make search full width and place the result count beneath or beside it at wider mobile widths.
- Use full-width Previous and Next controls at compact widths, with page position announced to assistive technology.

### Project detail

- Lead with a concise identity and status summary.
- Use two-column metric cards instead of a long one-column metric stack.
- Order mobile sections as Budget, Tasks, Payments, and Expenses.
- Stack budget and chart panels while retaining existing visualizations.
- Preserve expandable task sections.
- Convert expenses to expandable cards with an accessible status-action menu.
- Ensure upcoming-payment actions remain available without hover.

### New project: details

- Keep all fields in a single column below 640px.
- Group project identity, location/type, and attachments into labeled sections.
- Retain the current two-step workflow.
- Convert the live preview into a collapsible `Preview project` section on mobile.
- Use a sticky Continue action and a visible `Step 1 of 2` indicator.

### New project: allocation

- Replace fixed table rows with editable allocation cards.
- Each card contains item name, allocation amount, validation, and a 44px delete action.
- Keep a running total in a sticky summary immediately above the final action area.
- Preserve existing draft persistence and payload construction.
- Show `Step 2 of 2` and a clear way to return to project details without losing work.

### New project expense

- Replace the 880px, seven-column editable grid with expandable line-item form cards.
- The collapsed summary shows item description and computed amount.
- Expanded content exposes supplier, task, quantity, unit cost, payment status, receipt upload, and remove action.
- Keep the overall total visible near the sticky Save action.
- Preserve the current project binding, API payload, uploads, and status normalization.

### Expenses

- Render filters as 44px chips in a horizontally scrollable filter rail. Only the filter rail may scroll; the page itself must not.
- Use compact metric cards with the most important total visually dominant.
- Replace the seven-column table with expandable transaction cards.
- Put less-frequent sorting and filtering controls in a bottom sheet.

### Suppliers list

- Convert the four-part summary strip into a 2×2 mobile metric grid.
- Stack category and payment filters at compact widths.
- Replace table rows with supplier cards showing supplier name, categories, receipt value, paid value, remaining balance, and a profile action.
- Preserve current sorting and search behavior.

### Supplier detail

- Stack identity and contact information into readable cards.
- Use two-column financial metrics where values remain legible.
- Preserve payment-distribution and project-allocation information.
- Replace the 560px history table with expandable receipt/payment cards.

### New supplier

- Group fields into Company and Contact sections.
- Use a single-column layout on mobile.
- Add an error summary and field-level messages.
- Use sticky Cancel and Save actions in focused task mode.

### Team

- Stack the Invite action beneath the heading at compact widths.
- Retain the summary information in compact cards.
- Replace the four-column table with member cards showing name, role, responsibility, access status, and row actions.

### Analytics

- Use a compact summary grid.
- Stack the spend and utilization charts vertically.
- Ensure chart legends and tooltips work with touch and keyboard input.
- Reuse the shared mobile expense-card list for all expenses.
- Keep Export analytics as a clear page-level action.

### Reports

- Use compact summary cards.
- Replace the report table with project report cards showing budget, remaining amount, utilization progress, and per-project export.
- Keep bulk export above the result list.

### Budget

- Feature the overall budget total, with spent and available values as secondary cards.
- Preserve the primary utilization progress card.
- Replace the project budget table with progress cards showing spent/allocated, remaining, location, and utilization.

### Settings

- Stack the desktop columns.
- Use setting rows at least 52px high.
- Allow long values and actions to stack beneath labels.
- Place Role access after notification preferences.
- Keep all existing values and permissions visible.

### Notifications

- Use a bottom or near-full-height mobile sheet.
- Stack due date and amount beneath the payment description rather than forcing competing columns.
- Preserve unread indicators, add actions, empty state, focus trapping, and focus restoration.

## 5. Forms Strategy

### Shared field requirements

- Use one column below 640px.
- Allow paired fields at 640px only when each field remains at least 240px wide.
- Make inputs, selects, date triggers, upload actions, and primary buttons 44–48px high.
- Use at least 16px text inside form controls to prevent iOS input zoom.
- Keep visible labels above controls; placeholders never replace labels.
- Standardize helper text, validation messages, required indicators, and optional indicators.
- Use `aria-invalid` and connect errors with `aria-describedby`.
- Preserve values following client validation, server errors, and upload failures.
- Apply appropriate `type`, `inputMode`, and `autocomplete` attributes.

### Error handling

- On failed submit, render an error summary near the start of the form.
- Move focus to the summary and provide links or clear references to invalid fields.
- Keep the first invalid field visible above the keyboard.
- Do not collapse a section that contains an error.
- Use a live region for asynchronous submission and upload status.

### Long-form organization

Use visible sections rather than a single undifferentiated card:

- Project identity
- Location and type
- Attachments
- Allocation
- Expense context
- Line items
- Supplier/company information
- Contact information

The existing two-step project flow remains two steps. Do not add more steps unless validation research proves they are necessary.

### Sticky actions

- Use sticky actions only in focused task mode.
- Position the surface above the device safe-area inset.
- Use a solid or highly opaque background.
- Let the primary action fill available width at compact widths.
- Keep Cancel or Back visible but subordinate.
- Avoid stacking the full navigation dock, sticky actions, and mobile keyboard simultaneously.

### Selects and date pickers

- Present long select menus as searchable bottom sheets on mobile.
- Keep collision-aware popovers for tablet and desktop.
- Render the calendar in a mobile dialog or bottom sheet rather than a viewport-fixed floating panel.
- Make calendar day targets at least 44px.
- Announce the selected date, active month, and validation errors.

### Upload controls

- Preserve drag-and-drop on desktop.
- Emphasize a large `Choose files` action on mobile.
- Show filename, size, progress, completion, failure, retry, and remove controls.
- Do not depend on drag gestures for any required action.

## 6. Tables Strategy

Desktop tables remain intact. Below 768px, render a mobile card/list representation from the same row model and state.

| Data set | Mobile pattern | Always visible | Expandable or secondary content |
| --- | --- | --- | --- |
| Home recent activity | Transaction cards | Item/project, amount, status | Task, supplier, date |
| All expenses | Expandable transaction cards | Item, amount, project, status | Supplier, task, date, actions |
| Project expenses | Expandable cards | Description, amount, status | Task, supplier, date, status actions |
| Project budgets | Progress cards | Project, spent/allocated, progress | Remaining amount, location |
| Suppliers | Supplier cards | Name, category, remaining balance | Receipt and paid values, profile action |
| Team | Member cards | Name, role, access | Responsibility and actions |
| Reports | Report cards | Project, utilization, remaining | Budget detail, export action |
| Allocation editor | Editable cards | Item name, allocation | Delete action, validation |
| Expense line items | Expandable form cards | Description, computed amount | All editable fields |
| Supplier history | Receipt/payment cards | Receipt, amount, status | Date, project, remaining balance |
| Project task expenses | Existing expandable task groups | Task, allocation, progress | Associated expenses |

### Shared data-view behavior

- Reuse TanStack filtering, sorting, pagination, and row identity.
- Render desktop tables and mobile cards from the same row model.
- Make the primary search field full width at compact widths.
- Put secondary filters and sorting options in a bottom sheet when they do not fit cleanly.
- Use a visible 44px overflow action for row actions.
- Use semantic lists for mobile card results and preserve table semantics on desktop.
- Show result count and active filters near the results.
- Preserve pagination state when switching orientation or crossing breakpoints.
- Do not use page-level horizontal scrolling at 320–767px.
- Horizontal scrolling is permitted only inside a true comparative matrix that loses meaning when converted to cards. None of the current primary dashboard tables meets that exception.

## 7. Implementation Roadmap

### Phase 0: Baseline and acceptance fixtures — P0

1. Capture desktop screenshots for every admin route before changes.
2. Create representative fixtures for empty, loading, error, short-content, long-content, and large-currency states.
3. Add viewport checks at 320, 390, 767, 768, 1024, and 1440px.
4. Record current keyboard navigation and screen-reader landmarks.

### Phase 1: Responsive foundations — P0

1. Add safe-area, mobile gutter, compact section-gap, and dock-height tokens.
2. Update `DashboardShell` to reserve dock space and use compact mobile rhythm.
3. Build the six-item glass dock and More sheet.
4. Simplify the mobile topbar and remove the redundant drawer trigger below 768px.
5. Establish shared 44–48px control sizing and 16px mobile form text.
6. Add reusable page-header, form-section, sticky-form-action, and responsive-data-view patterns.
7. Define focused task mode for create/edit routes.

### Phase 2: Highest-frequency pages — P0

Implement and validate:

1. Home
2. Projects list
3. Project detail
4. Expenses
5. Suppliers list
6. Supplier detail

This phase removes the most harmful compressed tables and covers the highest-value operational workflows.

### Phase 3: Creation and editing — P0

1. New project details
2. Project allocation
3. New project expense
4. New supplier
5. Mobile date picker
6. Mobile selects and sheets
7. Upload states
8. Validation summaries and sticky actions

Do not change API payloads, authentication, server actions, routing contracts, draft storage, or mutation semantics.

### Phase 4: Secondary pages — P1

1. Team
2. Analytics
3. Reports
4. Budget
5. Settings
6. Notifications and More-sheet refinement

### Phase 5: Accessibility and performance hardening — P1

1. Complete keyboard, VoiceOver, TalkBack, zoom, and contrast passes.
2. Verify reduced-motion, high-contrast, and reduced-transparency behavior.
3. Validate touch chart interactions and accessible chart summaries.
4. Measure dock mount stability and interaction latency.
5. Ensure only one backdrop-filter layer is active in normal use.
6. Remove duplicated calculations between mobile and desktop renderers.
7. Animate only opacity and transform for overlays and navigation feedback.

### Phase 6: Regression and release — P0

1. Run visual regression at mobile, tablet, and desktop widths.
2. Complete the route-by-route acceptance matrix.
3. Validate real devices and PWA/standalone mode.
4. Use a short-lived responsive-navigation feature flag if production risk requires staged rollout.
5. Compare mobile completion, abandonment, validation-error, and navigation metrics after release.

### Definition of done

- Every authenticated admin route works at 320px without page-level horizontal scrolling.
- All primary destinations are reachable through the dock or More.
- All form fields and row actions work without hover.
- No content is obscured by the dock, safe area, sticky actions, or keyboard.
- Desktop reference screenshots remain unchanged except for approved shared-control improvements.
- Existing API, authentication, routing, filtering, sorting, pagination, upload, draft, and submission behavior remains intact.
- Automated and manual accessibility checks pass the requirements in this specification.

## 8. Testing Checklist

### Viewport matrix

Test every populated and empty route at:

- 320×568
- 360×800
- 375×812
- 390×844
- 412×915
- 480×800
- 640×960
- 767×1024
- 768×1024
- 820×1180
- 1024×768
- 1280×800
- 1440×900

The 767/768 pair is mandatory because navigation architecture changes at that boundary.

### Browser and device matrix

- iPhone Safari, including a notched device
- iPhone Safari in standalone/PWA mode
- Android Chrome on mid-range hardware
- Samsung Internet
- iPad Safari in portrait and landscape
- Desktop Chrome, Firefox, Safari, and Edge

### Navigation checks

- Active state on list, detail, and creation routes
- More active for Reports, Expenses, Budget, and Settings
- Back, forward, reload, and deep links
- Dock behavior after sign-in and onboarding redirects
- Safe-area spacing and orientation changes
- Dock hidden and restored during focused tasks
- No important content underneath the dock
- Focus enters, remains within, and returns from the More sheet correctly

### Form checks

- Empty submit and individual invalid fields
- Error summary focus and field association
- Server error, upload failure, retry, and slow submission
- Keyboard Next/Previous navigation
- Numeric, email, telephone, and date keyboard behavior
- Date selection at viewport edges
- Long labels, translated strings, and multi-line errors
- Browser autofill
- Value retention after errors and navigation between project steps
- Sticky actions with and without the keyboard visible

### Data-view checks

- Empty, one-row, five-row, and large datasets
- Very long project, supplier, task, member, and item names
- Large and negative currency values where supported
- Search, sorting, pagination, filtering, expansion, and row actions
- Status mutations reflected in both mobile cards and desktop tables
- Orientation changes preserve active filters and pagination
- Screen-reader reading order is logical

### Accessibility checks

- Keyboard-only operation
- VoiceOver and TalkBack
- 200% and 400% zoom/reflow
- Visible focus indication
- Correct headings, landmarks, labels, and descriptions
- `aria-current` on navigation
- 4.5:1 text contrast and 3:1 control/non-text contrast
- Glass contrast over light and dark page content
- Reduced motion, increased contrast, and reduced transparency
- No focus trapped behind sheets, dialogs, or sticky layers
- Focus restoration after overlays close
- Minimum 44×44px targets

### Performance requirements

- No visible layout shift when the dock mounts.
- Common interactions remain smooth on mid-range Android hardware.
- Target INP below 200ms and CLS below 0.1.
- Do not eagerly load heavy mobile-only overlays before they are required.
- Charts and long lists must not block navigation shell rendering.
- Avoid blur on large scrolling containers and avoid animating layout properties.

## Implementation Constraints

- Preserve all existing functionality and data contracts.
- Reuse current shared components and design tokens wherever they can meet the requirements.
- Introduce shared responsive patterns instead of route-specific one-off CSS.
- Keep desktop tables and layouts unless a shared accessibility improvement is explicitly approved.
- Read the relevant Next.js 16.2.6 guides in `node_modules/next/dist/docs/` before implementation work that changes framework APIs, routing, server/client boundaries, or conventions.
- Verify each phase before beginning the next high-risk workflow phase.
