/**
 * Remembers the workspace last viewed, so the entry redirect returns you where
 * you left off instead of picking an arbitrary membership.
 *
 * Written by proxy.ts, which keeps its own copy of this name — the proxy runs
 * before the app modules load and cannot import from here. Keep the two in
 * sync.
 */
export const LAST_WORKSPACE_COOKIE = "zimba_last_workspace"
