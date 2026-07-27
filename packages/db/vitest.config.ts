import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    // The integration test opens its own pool and skips unless
    // TEST_DATABASE_URL is set.
    include: ["tests/**/*.test.ts", "tests/**/*.integration.test.ts"],
  },
})
