const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

export function formatReceiptNumber({
  fallbackId,
  organizationName,
  receiptNumber,
}: {
  fallbackId: string
  organizationName: string
  receiptNumber?: string | null
}) {
  if (receiptNumber && !UUID_PATTERN.test(receiptNumber)) {
    return receiptNumber
  }

  const organizationCode =
    organizationName
      .trim()
      .split(/[^a-z0-9]+/i)
      .filter(Boolean)
      .slice(0, 2)
      .join("-")
      .toUpperCase() || "ORG"
  const digits = fallbackId.replace(/\D/g, "")
  const sequence =
    digits.length >= 4
      ? digits.slice(-6).padStart(6, "0")
      : hashToDigits(fallbackId)

  return `${organizationCode}-${sequence}`
}

function hashToDigits(value: string) {
  let hash = 0
  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) % 1_000_000
  }
  return String(hash).padStart(6, "0")
}
