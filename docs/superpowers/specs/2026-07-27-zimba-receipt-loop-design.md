# Zimba v1 Workflow Design

## Purpose

Map every Zimba v1 workflow in Figma so the whole product can be judged before
implementation. Develop the three everyday money-recording workflows to
mid-fidelity web views. The work follows the product shape in
`docs/zimba-v1.html` and the 37signals principle of building the smallest
complete product.

## Deliverable

Create one new Figma file and one working page with two fidelity levels:

1. Low-fidelity maps for all 14 workflows in the HTML plan.
2. Mid-fidelity web views for Snap, File, and Pay a receipt.

The low-fidelity and mid-fidelity work sit on the same page so the three core
flows can be compared with their interface direction. This is not a complete
application mockup or a full clickable prototype.

## Low-Fidelity Workflow Inventory

Group the 14 workflows under the same five headings used in the HTML plan. Each
flow shows its actor, entry point, key places, primary actions, finish state,
and important handoffs.

### Getting in

1. W1: Join Zimba.
2. W2: Invite the crew.

### Setting up

1. W3: Start a project.
2. W4: Change the budget.

### Every day

1. W5: Snap a receipt.
2. W6: File a receipt.
3. W7: Pay a receipt.

### Knowing where you stand

1. W8: Check a project.
2. W9: Find a receipt again.
3. W10: Check a supplier.

### Keeping the record

1. W11: Files.
2. W12: Fix a mistake.
3. W13: Close a project.
4. W14: Come back tomorrow.

The map must make role boundaries explicit and show how completed work changes
what the next actor sees.

## Mid-Fidelity Web Views

### W5: Snap a receipt

- Desktop web frame.
- Receipt photo is the dominant element.
- Last-used project is preselected and easy to change.
- Two actions: **Add another** and **Done**.
- No supplier, amount, date, budget line, payment state, notes, or OCR.
- Large targets and high contrast for use in difficult site conditions.
- Offline state uses the copy: "Saved on your phone. It'll upload when you have
  signal."

### W6: File a receipt

- Desktop web frame.
- Large, zoomable receipt photo on the left.
- Supplier, amount, budget line, and paid state on the right.
- One primary action: **File**. One secondary action: **Skip**.
- New suppliers and budget lines are created inline without leaving the queue.
- Filing loads the next receipt in place and reduces the inbox count.
- No approval step, bulk edit, tax fields, duplicate detection, or assignment.

### W7: Pay a receipt

- Desktop web receipt-detail frame.
- Amount owed and payment history are visible together.
- Payment method uses four direct choices: cash, mobile money, bank, and other.
- Partial payment uses one amount field and an optional reference.
- **Record payment** is the primary action.
- A completed write appears immediately in the payment list and updates the
  unpaid amount.
- No bank integration, approval, scheduled payment, or confirmation dialog.

## Visual Direction

- Quiet, practical, and work-focused.
- Plain language rather than accounting terminology.
- Restrained color used for state and action, not decoration.
- High contrast and clear hierarchy.
- Minimal borders and surfaces; no dashboard cards or decorative charts.
- Consistent spacing and typography through reusable Figma styles or variables.
- Repeated elements should be components rather than detached copies.

## Figma Structure

- File: `Zimba v1 Workflows`
- Page: `All Workflows`

The page is arranged in two large horizontal zones:

1. Low-fidelity workflow groups for W1 through W14, arranged in plan order.
2. Mid-fidelity web views for W5, W6, and W7, aligned beneath their low-fidelity
   flows.
3. A compact component area beneath the mid-fidelity views for reusable
   buttons, fields, receipt preview, project picker, paid-state control, and
   payment-method control.

Section labels and generous canvas spacing separate the fidelity levels without
splitting the work across pages.

## Success Criteria

- A reviewer can find and understand every workflow from the HTML plan.
- Crew and Manager responsibilities cannot be confused.
- The Crew path requires only the photo and project confirmation.
- The Manager path has a visible finish line.
- The three mid-fidelity flows reinforce the workflow map without introducing
  new features.
- The design remains within the no-go boundaries in `docs/zimba-v1.html`.

## Deferred

- Full navigation design.
- Mid-fidelity views for W1-W4 and W8-W14.
- Production-ready design system.
- Mobile and tablet views.
- Clickable prototype across every step.
