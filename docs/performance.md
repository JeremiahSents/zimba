# Performance foundations

Zimba keeps authenticated workspace and platform-admin routes request-bound. They resolve the session and tenant from request headers/cookies, so tenant-specific database results are not placed in a shared Next.js cache.

Next.js 16.2.6 Cache Components was evaluated against the installed documentation. It is intentionally not enabled globally yet: the current route trees contain request-bound authentication and tenant resolution at layouts/pages, and enabling it would require adding Suspense boundaries around every uncached request before the build can safely produce a static shell. The existing `loading.tsx` boundaries provide local navigation feedback without changing data ownership or cache semantics.

When a future route has cacheable data, the cached function must receive the workspace or platform scope as an explicit argument, use a stable tenant-scoped tag, and invalidate that tag in the same mutation path. Auth/session resolution must remain outside the cached function.
