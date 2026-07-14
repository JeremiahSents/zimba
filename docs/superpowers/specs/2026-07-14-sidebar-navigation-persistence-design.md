# Sidebar Navigation Persistence

## Goal

Preserve the desktop sidebar's collapsed or expanded state when users navigate between admin pages and when they refresh the application.

## Design

Add an `/admin` App Router layout that reads the existing `sidebar_state` cookie with Next.js's asynchronous `cookies()` API. The layout mounts one `SidebarProvider` around all admin routes and passes the cookie value through `defaultOpen`. A missing or invalid cookie defaults to the current expanded state.

Move provider ownership out of `DashboardShell`. Each page continues to render its own sidebar and page-specific top bar through `DashboardShell`, but the provider state now lives above route transitions. This means client-side navigation does not recreate the state container, while direct loads and refreshes use the cookie to render the correct initial width.

The existing sidebar toggle remains responsible for updating the cookie. Mobile sheet state remains independent and continues to close normally; the persisted preference applies to the collapsible desktop sidebar.

## Verification

- Collapse the desktop sidebar and navigate through multiple sidebar links; it stays collapsed.
- Expand it and navigate again; it stays expanded.
- Refresh in both states; the server-rendered initial state matches the cookie without a width flash.
- Confirm mobile sidebar behavior is unchanged.
- Run formatting, type checking, linting, React Doctor, and browser verification.
