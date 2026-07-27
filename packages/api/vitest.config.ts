import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      // Use cases import the db client directly, so the module must construct a
      // pool at import time. pg connects lazily, so no server is contacted.
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/zimba_test",
    },
  },
})
