# Home dashboard visual polish design

## Goal

Extend the updated overview-card visual language through the home dashboard, with clearer type hierarchy and more comfortable navigation affordances.

## Header

- Keep the home greeting in the shared header, but use a medium or semibold weight rather than a display-heavy treatment.
- Increase the sidebar trigger's touch target and icon size while preserving the current header height and behavior.

## Overview cards

- Retain the existing four metrics and trend values.
- Refine card label, value, icon container, and trend pill spacing and weights to closely follow the supplied reference.

## Home sections

- Make `Active projects` and `Recent activity` use the same clear section heading hierarchy as `Overview`.
- Refine project rows with balanced spacing, quieter supporting data, obvious budget progress, and lightweight action links.
- Apply the same typography rhythm to recent activity without changing its content, routes, or empty state.

## Boundaries and verification

- Update only home dashboard components and the shared sidebar trigger styling.
- Preserve project, analytics, notification, and settings behavior.
- Run formatting, typechecking, linting, and a production build after implementation.
