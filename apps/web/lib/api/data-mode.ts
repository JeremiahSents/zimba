import "server-only"

export type DataMode = "live" | "mock"

const warnedValues = new Set<string>()

export function parseDataMode(value: string | undefined): DataMode {
  const normalized = value?.trim().toLowerCase()
  if (normalized === "mock" || normalized === "live") return normalized

  if (normalized && !warnedValues.has(normalized)) {
    warnedValues.add(normalized)
    console.warn(
      `Invalid ZIMBA_DATA_MODE value "${value}"; defaulting to live mode.`
    )
  }

  return "live"
}

export function getDataMode(): DataMode {
  return parseDataMode(process.env.ZIMBA_DATA_MODE)
}

export function isMockDataMode(): boolean {
  return getDataMode() === "mock"
}
