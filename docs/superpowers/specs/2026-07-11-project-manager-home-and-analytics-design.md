# Project Manager Home and Analytics Design

## Goal

Replace the analytics-heavy dashboard landing page with a simple operational home for project managers. The page should answer three questions at a glance: what can I do now, what needs attention, and how are my projects doing?

## Product direction

The home page becomes a project command center. Project context and actionable exceptions take priority over historical charts. The existing spend chart, utilization chart, and recent-expenses table move to a dedicated Analytics page.

The two primary home actions are `Add expense` and `New project`. `Add expense` remains the stronger action because it is expected to be used more frequently.

## Home page hierarchy

### 1. Welcome and actions

- Greeting: `Good morning, Musa`
- Supporting copy: `Here’s what needs your attention today.`
- Primary action: `Add expense`
- Secondary action: `New project`

The wording stays short and direct. On small screens the actions wrap below the greeting.

### 2. Portfolio summary

Show four compact values in one shared card:

- Active projects
- Needs attention
- Total budget
- Total spent

These are current portfolio facts, not trends. Values are derived from the existing project data. The attention count is derived from the same rules used by the attention section.

### 3. Needs attention

Show a short list of the most important actionable exceptions. Each row contains:

- Severity marker
- Plain-language issue
- Project name when applicable
- One contextual fact
- A direct action

Initial attention rules use data already available:

- Project budget utilization at or above 80%: `Review budget`
- No active projects: `Create project`

Pending approvals, overdue deadlines, and missing information are excluded until the API provides reliable fields for them. Empty state: `Everything looks on track.`

### 4. Active projects

Show all current projects as compact project rows or cards. Each project includes:

- Name and location
- Health label derived from budget utilization: `On track` below 80%, `At risk` from 80% through 99%, and `Over budget` at 100% or more
- Budget utilization progress
- Spent and remaining amounts
- `View project` action

Deadlines and delivery progress are omitted because the current project response does not contain those fields. The section includes a `View all projects` link. Empty state explains that no projects exist and offers `Create project`.

### 5. Recent activity

Recent activity remains secondary and compact. Show only a few recent expense entries with project, supplier/item context, amount, and date. Include a link to Analytics for the full table. Empty state: `No activity yet.`

## Analytics page

Add `/dashboard/analytics` and an `Analytics` sidebar item. This page contains the information removed from Home:

- Existing portfolio stat filters where useful
- Spend by project chart
- Budget utilization chart
- Full recent-expenses table

The page title is `Analytics` and the supporting purpose is understanding portfolio spending and budget performance. Reports remains a separate export-oriented destination.

## Reuse and component boundaries

- Reuse `DashboardShell`, cards, buttons, progress, currency formatting, and existing typed dashboard data.
- Reuse `SpendBarChart`, `UtilizationAreaChart`, and `ExpenseTable` on Analytics.
- Reuse the existing project creation sheet for `New project`.
- Extract or share an expense-creation trigger only if needed to make the home action functional without duplicating form logic.
- Keep attention-rule derivation in a small pure helper so the count and list cannot disagree.
- Keep Home and Analytics as separate feature components with no analytics-specific rendering left in Home.

## Responsive behavior

- Desktop: four summary values in one row; attention rows and projects use the full content width.
- Tablet: summary values form a two-column grid.
- Mobile: summary values stack, header actions become full-width or wrap naturally, project metrics collapse into a readable vertical arrangement, and tables retain their existing responsive behavior.

## Interaction and navigation

- `Add expense` opens the existing expense flow or routes to the appropriate expense entry context.
- `New project` opens the existing project creation sheet.
- Attention actions deep-link to Budget, Expenses, or Projects as appropriate.
- Selecting a project or `View project` opens `/dashboard/projects/[id]`.
- `View analytics` and the Analytics sidebar item open `/dashboard/analytics`.

## Data and error behavior

The existing dashboard loader remains the source for projects and expenses. API failures continue to use typed mock data and display the existing mock-data notice. Derived totals must handle empty arrays and zero budgets without division errors.

## Verification

- Home contains no charts or full analytics table.
- Analytics renders both existing charts and the full recent-expenses table.
- Summary totals match project data.
- Attention count matches visible attention items.
- Project health thresholds handle 0%, 80%, 100%, and budgets of zero.
- Empty projects and empty expenses produce clear empty states.
- Navigation highlights Home and Analytics correctly.
- Desktop and mobile layouts remain readable.
- Existing lint, typecheck, and relevant React checks pass.

## Out of scope

- New backend fields for deadlines, approvals, delivery progress, or missing project information
- Changes to the Reports page beyond preserving its current role
- Redesigning project detail, budget, expense, supplier, or team pages
- New chart types or historical analytics
