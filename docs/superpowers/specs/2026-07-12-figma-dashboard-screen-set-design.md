# Zimba Figma Dashboard Screen Set Design

## Goal

Create a complete, responsive Figma representation of the current Zimba dashboard. The file will support product review, flow validation, and implementation handoff without inventing a second visual system.

## Source of truth

The current React application and shared UI package remain the visual source of truth. The Figma work reuses their Lausanne typography, restrained radii, quiet card surfaces, green primary color, botanical financial-dashboard character, shared controls, and responsive behavior.

## File structure

The Figma file contains four ordered areas:

1. **Design system** — color and spacing tokens, type scale, and reusable navigation, button, card, metric, table row, badge, progress, input, select, dialog, and sheet patterns.
2. **Desktop dashboard** — 1440px-wide screens with the persistent sidebar, top bar, page container, and footer.
3. **Mobile dashboard** — 390px-wide equivalents with compact top bar, navigation trigger, single-column content, and touch-appropriate actions.
4. **Project flow prototype** — connected desktop and mobile paths through projects, project detail, new project, expense entry, and notification states.

## Screen inventory

Each screen is built at desktop and mobile sizes:

- Home / Overview
- Projects list
- Project detail
- New project
- Budget
- Expenses
- Suppliers
- Team
- Analytics
- Reports
- Settings

Supporting interaction states include the notification sheet, the project creation form, the new-expense sheet, and the add-upcoming-payment dialog. Screens use the typed mock-data scenarios currently shown by the application.

## Shared layout and visual rules

- Desktop uses a persistent collapsible sidebar, a 64px minimum top bar, a centered content column, and a quiet footer.
- Mobile replaces the persistent sidebar with a navigation trigger; page actions wrap or become full-width where needed.
- The visual system uses white and soft-neutral surfaces, a deep ink text color, muted metadata, subtle borders, 6–16px radii, and the existing green primary accent.
- Cards carry information hierarchy through spacing and typography, not heavy shadows. Tables use one containing surface and dividing rows.
- Lausanne is used for headings and body text, with tabular figures for currency and quantitative values.
- Charts retain the established green tonal scale and clear compact labels.

## Responsive behavior

- Metric groups progress from four columns on desktop to two columns on tablet and one column on mobile.
- Two-column analytics, project, and settings layouts stack on mobile.
- Tables preserve key fields; lower-priority columns may be hidden or moved into a row detail treatment on mobile.
- Sheets are right-side panels on desktop and full-height mobile panels on narrow viewports; dialogs remain focused and do not obscure required actions.
- Chart cards fill available width and preserve readable legends without fixed desktop-only dimensions.

## Prototype flows

1. **Review portfolio:** Home → attention item or active project → Project detail → Expenses.
2. **Create a project:** Projects → New project → completed form → Projects list → Project detail.
3. **Record an expense:** Project detail → New expense sheet → saved expense state → updated project expense list.
4. **Review analysis:** Home → Analytics → Reports.
5. **Mobile navigation:** Any mobile page → navigation trigger → selected destination.

## Completion criteria

- Every listed screen exists at both 1440px and 390px widths.
- Repeated interface patterns use Figma components or shared instances.
- Colors, typography, spacing, radii, and controls visibly match the codebase design system.
- Desktop and mobile flows are linked through prototype interactions.
- Visual checks confirm no clipped text, overlapping content, placeholder labels, or incorrect font family.

## Out of scope

- Changing application behavior, data, or code.
- Designing new product features not represented by the current dashboard routes and interaction states.
- Tablet-specific frames beyond the responsive rules above.
