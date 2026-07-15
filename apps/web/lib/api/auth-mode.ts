import "server-only"

import { isMockDataMode } from "@/lib/api/data-mode"

export type AuthMode = "live" | "bypass"

export const MOCK_AUTH_IDENTITY = {
  name: "Mobile Tester",
  organizationId: "mock-mobile-workspace",
  organizationName: "Mock Workspace",
  role: "owner",
} as const

const warnedValues = new Set<string>()
let warnedUnsafeCombination = false

export function parseAuthMode(value: string | undefined): AuthMode {
  const normalized = value?.trim().toLowerCase()
  if (normalized === "live" || normalized === "bypass") return normalized

  if (normalized && !warnedValues.has(normalized)) {
    warnedValues.add(normalized)
    console.warn(
      `Invalid ZIMBA_AUTH_MODE value "${value}"; defaulting to live authentication.`
    )
  }

  return "live"
}

export function getAuthMode(): AuthMode {
  return parseAuthMode(process.env.ZIMBA_AUTH_MODE)
}

export function isAuthBypassEnabled(): boolean {
  if (getAuthMode() !== "bypass") return false
  if (isMockDataMode()) return true

  if (!warnedUnsafeCombination) {
    warnedUnsafeCombination = true
    console.warn(
      "ZIMBA_AUTH_MODE=bypass requires ZIMBA_DATA_MODE=mock; using live authentication."
    )
  }
  return false
}
