const compactCurrencyFormatter = new Intl.NumberFormat("en-UG", {
  currency: "UGX",
  maximumFractionDigits: 3,
  notation: "compact",
  style: "currency",
})

const dateFormatter = new Intl.DateTimeFormat("en-UG", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function formatCurrency(amount: number) {
  return compactCurrencyFormatter.format(amount).replace("UGX", "USh ")
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

/**
 * Capitalises the first letter of each word for display. Only touches the
 * leading character, so acronyms and existing capitals survive ("my home" →
 * "My Home", "ACME site" → "ACME Site").
 */
export function formatTitleCase(value: string) {
  return value.replace(/(^|\s)(\S)/g, (_, lead, first) => lead + first.toUpperCase())
}

export function formatShortDate(date: string) {
  const value = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00`)
    : new Date(date)

  return Number.isNaN(value.getTime())
    ? "Unknown date"
    : dateFormatter.format(value)
}
