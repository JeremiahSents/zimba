# Mobile receipt entry and preview

## Goal

Make the new receipt page easy to complete on a phone by separating data entry from receipt review while preserving the existing desktop editor and live preview.

## Mobile flow

The page has two client-side steps below the `md` breakpoint:

1. **Enter details** shows receipt details, purchased items, and payment fields. The fixed action bar contains Cancel and Continue.
2. **Preview** shows the invoice-style receipt at full width. The fixed action bar contains Back to edit and Save receipt.

Moving between steps does not clear form state. Continue validates the same required supplier, date, and item fields used by Save. Validation errors keep the user on the entry step and focus the page near the alert. Save retains the existing payment and upload validation and persistence behavior.

## Mobile item design

Each line item is a compact card rather than a stacked desktop table row. The card includes:

- An item number and a Remove control in its header.
- Labeled Item and Category fields.
- Quantity and Rate side by side.
- A read-only calculated Amount row.

The Add item control and receipt total follow the item cards. Touch targets remain at least 44 pixels tall, numeric fields keep numeric input modes, and labels remain visible so values are unambiguous.

## Desktop behavior

At `md` and wider, retain the current receipt table, side-by-side live preview, and top Cancel/Save actions. Mobile step state must not alter desktop visibility or saving behavior.

## Responsive layout

- Remove excess outer spacing on narrow screens while keeping cards visually separated.
- Hide the receipt preview during mobile entry and hide the editor during mobile preview.
- Reserve bottom padding for the fixed mobile action bar and device safe-area inset.
- Keep validation alerts visible in both steps.

## Verification

- Verify the item editor at narrow widths has explicit labels, compact spacing, and no horizontal overflow.
- Verify Continue blocks incomplete receipts and displays the existing validation message.
- Verify Continue opens the populated preview and Back to edit preserves every value.
- Verify Save remains available only from preview on mobile and completes the existing workflow.
- Verify desktop layout and actions are unchanged.
- Run typecheck, lint, React Doctor, and browser checks at phone and desktop widths.
