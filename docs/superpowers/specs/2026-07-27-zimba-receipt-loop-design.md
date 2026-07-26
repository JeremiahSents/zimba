# Zimba Receipt Loop Design

## Purpose

Design the central Zimba v1 workflow in Figma so the handoff between Crew and
Manager can be judged before implementation. The work follows the product shape
in `docs/zimba-v1.html` and the 37signals principle of building the smallest
complete workflow.

## Deliverable

Create one new Figma file and one working page with two fidelity levels:

1. A low-fidelity workflow map showing the complete Crew-to-Manager handoff.
2. Two mid-fidelity web screens showing the intended interface direction.

The low-fidelity and mid-fidelity work sit on the same page so each screen can
be compared with the workflow decision it represents. This is not a complete
application mockup or a full clickable prototype.

## Workflow Map

Use two horizontal lanes with a visible handoff between them.

### Crew lane

1. Receipt arrives.
2. Crew taps **Add receipt**.
3. The camera opens directly.
4. Crew confirms the preselected project.
5. The receipt is saved immediately and uploads in the background.

### Manager lane

1. Manager opens Zimba and lands in **Inbox**.
2. Manager opens the oldest receipt.
3. Manager enters supplier, amount, budget line, and paid state.
4. Filing advances to the next receipt without returning to the list.
5. The session ends at an empty inbox.

The map must make the ownership boundary explicit: Crew captures reality;
Manager completes the financial record.

## Mid-Fidelity Web Screens

### Crew confirmation

- Desktop web frame.
- Receipt photo is the dominant element.
- Last-used project is preselected and easy to change.
- Two actions: **Add another** and **Done**.
- No supplier, amount, date, budget line, payment state, notes, or OCR.
- Large targets and high contrast for use in difficult site conditions.
- Offline state uses the copy: "Saved on your phone. It'll upload when you have
  signal."

### Manager filing

- Desktop web frame.
- Large, zoomable receipt photo on the left.
- Supplier, amount, budget line, and paid state on the right.
- One primary action: **File**. One secondary action: **Skip**.
- New suppliers and budget lines are created inline without leaving the queue.
- Filing loads the next receipt in place and reduces the inbox count.
- No approval step, bulk edit, tax fields, duplicate detection, or assignment.

## Visual Direction

- Quiet, practical, and work-focused.
- Plain language rather than accounting terminology.
- Restrained color used for state and action, not decoration.
- High contrast and clear hierarchy.
- Minimal borders and surfaces; no dashboard cards or decorative charts.
- Consistent spacing and typography through reusable Figma styles or variables.
- Repeated elements should be components rather than detached copies.

## Figma Structure

- File: `Zimba Receipt Loop`
- Page: `Receipt Loop`

The page is arranged left to right:

1. Low-fidelity Crew and Manager workflow lanes.
2. Mid-fidelity Crew confirmation web view.
3. Mid-fidelity Manager filing web view.
4. A compact component area beneath the screens for reusable buttons, fields,
   receipt preview, project picker, and paid-state control.

Section labels and generous canvas spacing separate the fidelity levels without
splitting the work across pages.

## Success Criteria

- A reviewer can understand the complete receipt loop without explanation.
- Crew and Manager responsibilities cannot be confused.
- The Crew path requires only the photo and project confirmation.
- The Manager path has a visible finish line.
- The two mid-fidelity screens reinforce the workflow rather than introducing new
  features.
- The design remains within the no-go boundaries in `docs/zimba-v1.html`.

## Deferred

- Full navigation design.
- Signup, invitations, projects, suppliers, payments, files, and archive flows.
- Production-ready design system.
- Mobile and tablet views.
- Clickable prototype across every step.
