import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    // Mirrors the "@/*" path in tsconfig.json so tests can address app modules
    // the same way app code does.
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/zimba_test",
      BETTER_AUTH_SECRET: "test-secret-that-is-at-least-thirty-two-characters",
      BETTER_AUTH_URL: "http://localhost:4000",
    },
  },
})
