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

export function formatShortDate(date: string) {
  const value = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00`)
    : new Date(date)

  return Number.isNaN(value.getTime())
    ? "Unknown date"
    : dateFormatter.format(value)
}
