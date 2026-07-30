/**
 * Rendering helpers for generated documents.
 *
 * Deliberately not reusing `apps/web/lib/format.ts`: that module's
 * `formatCurrency` uses compact notation ("USh 1.2M"), which is right for a
 * dashboard tile and wrong for a receipt someone files for tax. Everything here
 * is full precision.
 *
 * Pure — no React, no `server-only` — so tests and callers on either side of
 * the render boundary can use it.
 */

const UGANDA_LOCALE = "en-UG"

const dateFormatter = new Intl.DateTimeFormat(UGANDA_LOCALE, {
  day: "numeric",
  month: "long",
  year: "numeric",
})

/**
 * UGX has no minor unit in practice, but the column still has to line up when a
 * currency that does (USD, EUR) shows up, so the decision is per-currency
 * rather than global.
 */
const ZERO_DECIMAL_CURRENCIES = new Set(["UGX", "JPY", "KRW", "RWF", "VND"])

export function formatMoney(amountCents: number, currency: string): string {
  const code = currency.trim().toUpperCase() || "UGX"
  const zeroDecimal = ZERO_DECIMAL_CURRENCIES.has(code)
  const value = zeroDecimal ? Math.round(amountCents / 100) : amountCents / 100

  const amount = new Intl.NumberFormat(UGANDA_LOCALE, {
    minimumFractionDigits: zeroDecimal ? 0 : 2,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  }).format(value)

  // `Intl` with style:"currency" renders UGX as "UGX 1,234"; the product says
  // "USh" everywhere else, so the symbol is applied by hand.
  return code === "UGX" ? `USh ${amount}` : `${code} ${amount}`
}

export function formatDocumentDate(value: string | null): string {
  if (!value) return "—"
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date)
}

export function formatMethod(method: string): string {
  const labels: Record<string, string> = {
    cash: "Cash",
    bank: "Bank transfer",
    mobile_money: "Mobile money",
    card: "Card",
    full_payment: "Full settlement",
    other: "Other",
  }
  return (
    labels[method] ??
    method.replace(/[_-]+/g, " ").replace(/^./, (c) => c.toUpperCase())
  )
}

export function formatSettlementStatus(status: string): string {
  const labels: Record<string, string> = {
    paid: "Paid in full",
    partially_paid: "Partially paid",
    unpaid: "Not paid",
  }
  return labels[status] ?? status
}

/**
 * UploadThing keys and email attachment names travel through URLs and mail
 * clients, so anything outside this set is replaced rather than escaped.
 */
export function toSafeFilename(value: string): string {
  const cleaned = value
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return cleaned || "document"
}
