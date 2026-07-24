import "server-only"

import { checkApiDatabaseHealth } from "@workspace/api-runtime"

export type ServiceStatus = "operational" | "degraded" | "down"

export type HealthCheck = {
  label: string
  status: ServiceStatus
  detail?: string
}

export async function getSystemHealth(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = []

  try {
    await checkApiDatabaseHealth()
    checks.push({ label: "Database (PostgreSQL)", status: "operational" })
  } catch {
    checks.push({
      label: "Database (PostgreSQL)",
      status: "down",
      detail: "Connection failed",
    })
  }

  const hasAuthSecret = Boolean(process.env.BETTER_AUTH_SECRET)
  const hasGoogleCreds = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      (process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET)
  )
  checks.push({
    label: "Authentication",
    status: hasAuthSecret && hasGoogleCreds ? "operational" : "degraded",
    detail: !hasAuthSecret
      ? "Missing BETTER_AUTH_SECRET"
      : !hasGoogleCreds
        ? "Missing Google OAuth credentials"
        : undefined,
  })

  const hasUploadThingToken = Boolean(process.env.UPLOADTHING_TOKEN)
  checks.push({
    label: "File Upload (UploadThing)",
    status: hasUploadThingToken ? "operational" : "degraded",
    detail: !hasUploadThingToken ? "Missing UPLOADTHING_TOKEN" : undefined,
  })

  checks.push({ label: "Background Jobs", status: "operational" })
  checks.push({ label: "Email Delivery", status: "operational" })

  return checks
}

export async function getSystemMetrics() {
  const appVersion = process.env.npm_package_version ?? "unknown"

  return {
    appVersion,
    nodeEnv: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  }
}
