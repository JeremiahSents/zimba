import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    env: {
      DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/zimba_test",
      BETTER_AUTH_SECRET: "test-secret-that-is-at-least-thirty-two-characters",
      BETTER_AUTH_URL: "http://localhost:3000",
      GOOGLE_CLIENT_ID: "test-client-id",
      GOOGLE_CLIENT_SECRET: "test-client-secret",
      UPLOADTHING_TOKEN: "test-uploadthing-token",
      RESEND_API_KEY: "test-resend-key",
      RESEND_FROM: "Zimba <noreply@zimba.digital>",
      APP_URL: "http://localhost:3000",
    },
  },
})
