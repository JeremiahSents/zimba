/**
 * `server-only` throws on import outside a React Server Component, which is the
 * whole point of it — but it makes `pdf/render.ts` unimportable from a test.
 * Vitest aliases the package to this no-op so the guard stays real in the app
 * and out of the way here.
 */
export {}
