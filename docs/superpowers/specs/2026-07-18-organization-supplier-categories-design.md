# Organization Supplier Categories

## Goal

Allow a user to create a reusable supplier category from the supplier form. Custom categories are visible only inside the active organization.

## Design

- Add an organization-scoped `supplier_category` table containing an ID, organization ID, display name, normalized slug, and timestamps.
- Enforce a unique `(organization_id, slug)` constraint so category names cannot be duplicated with different capitalization or spacing.
- Continue showing the built-in categories: Materials, Labour, Equipment, and Services.
- Add a **Create category** link below the category selector. It opens a mobile-friendly dialog with one required name field.
- A thin Server Action validates the session and input, creates the category through the supplier service, and returns the created category.
- After creation, the dialog closes and the new category becomes the selected supplier category immediately.
- Supplier category removal and category-management screens are outside this change.

## Errors and testing

- Empty names return a field-level validation message.
- Duplicate organization categories return a clear conflict message.
- Organization scoping applies to both listing and creation.
- Verify schema generation, unit tests, type checking, linting, React Doctor, and the production build.
