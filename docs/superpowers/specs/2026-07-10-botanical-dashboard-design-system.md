# Botanical Dashboard Design System

## Goal

Establish a reusable design system in `packages/ui`, inspired by the supplied botanical greenhouse reference, then migrate the complete authenticated dashboard to it. Shared primitives own visual treatment; application pages own content and responsive composition.

## Scope

This phase includes:

- Design tokens and typography in `packages/ui`.
- Shared primitive restyling and semantic variants.
- A small set of repeated dashboard composition components.
- Dashboard shell, sidebar, topbar, overview, Budget, Projects, Expenses, Suppliers, Team, Reports, and Settings migration.
- Automated checks for hardcoded component styling and native controls where shared primitives exist.

Landing and login page migration are explicitly deferred.

## Visual direction

The dashboard adopts a calm editorial-financial character: warm cream canvas, forest-green ink, botanical tinted panels, flat surfaces, and generous spacing. Depth comes from cream, keylime, mint, sage, and slate surface layers rather than shadows.

### Typography

- Cormorant Garamond is the display face for page and section headings.
- Manrope is the interface face for navigation, controls, forms, body text, tables, and numeric data.
- Headings use restrained weights and tight tracking; UI labels prioritize legibility and compact rhythm.
- Uppercase tracking is reserved for eyebrow and navigation-group labels.

### Core palette

- Forest Ink: primary actions, links, headings, and active icons.
- Cream Paper: application canvas and neutral inset surfaces.
- Keylime Wash: light supporting panels.
- Mint Veil: accent panels and section separation.
- Sage Mist: emphasized feature and summary panels.
- Slate Hush: cool counterpoint for analytics or product-like data panels.
- Charcoal: body and secondary UI ink.
- Border Mist: subtle dividers and input boundaries.

Semantic success, warning, and destructive states remain available as restrained tokens because financial software must communicate operational state clearly. They are exposed through component variants, not inline color utilities.

## Token architecture

`packages/ui/src/styles/globals.css` is the single source of truth for:

- Semantic colors and surface colors.
- Font families, font sizes, line heights, and tracking.
- Border radii.
- Control heights and component spacing.
- Container width and page spacing.
- Chart colors and sidebar tokens.
- Focus, disabled, destructive, warning, and success states.

Tailwind theme mappings expose tokens as semantic utilities. Application code must prefer semantic names such as `bg-background`, `bg-surface-sage`, and `text-primary` instead of raw palette values.

## Shared primitives

The existing shadcn/Base UI-compatible components remain the foundation. Their APIs are normalized so application code never recreates their visual treatment.

### Button

- Variants: primary, secondary, outline, ghost, destructive, and link.
- Sizes own height, padding, radius, icon sizing, and typography.
- Forest primary treatment and interaction states live in the shared component.
- Dashboard code must not render raw `<button>` elements or restyle buttons with component-level colors and radii.

### Card

- Flat, shadowless base with 14px radius.
- Tone variants: cream, keylime, mint, sage, and slate.
- Size variants own internal padding and section gaps.
- Card header, title, description, content, and footer define consistent spacing.

### Badge and status

- Fully pill-shaped.
- Neutral and branded tones live in `Badge`.
- `StatusBadge` maps business states such as active, pending, at risk, paid, and overdue to shared semantic tones.

### Forms

- Input, Select, Label, Field, and related controls share height, radius, border, focus ring, disabled state, and error treatment.
- Dashboard code composes these primitives and does not reproduce control chrome.

### Data display and overlays

- Table owns header, row, cell, hover, divider, and responsive overflow treatment.
- Progress owns track/indicator geometry and semantic tone variants.
- Tabs, Sheet, Sidebar, Avatar, Separator, Skeleton, Tooltip, and charts consume the same tokens.

## Dashboard compositions

Only repeated patterns become shared compositions:

- `PageHeader`: eyebrow or breadcrumb, title, description, and actions.
- `StatCard`: icon, label, numeric value, supporting detail, and optional tone.
- `DataPanel`: titled card wrapper for tables, charts, and activity lists.
- `EmptyState`: icon, explanation, and action.
- `StatusBadge`: business-state-to-visual mapping.

These components belong in `packages/ui` when they are product-agnostic. Zimba-specific content mapping remains in `apps/web`.

## Dashboard migration

Migration order:

1. Tokens and fonts.
2. Core primitives.
3. Dashboard shell, sidebar, and topbar.
4. Shared dashboard compositions.
5. Overview and chart surfaces.
6. Budget and Projects.
7. Expenses, Suppliers, Team, Reports, and Settings.
8. Hardcoded-style cleanup and responsive visual verification.

Application files may use layout utilities for grid columns, responsive breakpoints, wrapping, alignment, and page-specific spacing. They may not define component colors, borders, radii, shadows, control heights, or repeated typography treatments when a shared component or token exists.

## Exceptions

- Brand-owned SVG fills and gradients remain embedded in SVG assets.
- Chart library selectors may retain literal values only where the library cannot consume CSS variables; prefer CSS variables whenever supported.
- One-off responsive layout measurements are allowed when they describe composition rather than component appearance.
- Semantic warning/destructive states must use system tokens, even if the reference palette does not define them.

## Compatibility and behavior

- Existing component imports remain stable wherever practical.
- New variants are additive before old ad-hoc styling is removed.
- Base UI behavior, keyboard interaction, focus visibility, disabled states, and accessible labeling are preserved.
- No data fetching, routing, or business logic changes are part of this migration.
- Existing uncommitted user changes are preserved and incorporated only where they overlap the approved visual migration.

## Verification

- Run web and UI TypeScript checks.
- Run ESLint.
- Run React Doctor after React changes.
- Search `apps/web` for raw interactive elements where shared primitives exist.
- Search application component files for hex, RGB/HSL, arbitrary shadows, arbitrary radii, and palette-specific Tailwind colors.
- Exclude approved SVG asset exceptions from hardcoded-color checks.
- Visually inspect dashboard routes at desktop and mobile widths.
- Confirm active, hover, focus-visible, disabled, loading, empty, warning, and destructive states remain readable.

## Acceptance criteria

- `packages/ui` defines the dashboard's colors, typography, geometry, and component styling.
- Cormorant Garamond and Manrope are loaded through the application's font setup and mapped to shared tokens.
- Dashboard screens contain no raw buttons, inputs, selects, textareas, or tables when a shared primitive exists.
- Dashboard component files contain no unapproved literal colors, arbitrary shadows, or component-specific radii.
- Cards are flat and use tinted surface layering for hierarchy.
- Shared components expose sufficient semantic variants for all migrated dashboard states.
- All authenticated dashboard routes render correctly at mobile and desktop widths.
- Typecheck and lint pass; React Doctor introduces no new warnings from migrated files.
