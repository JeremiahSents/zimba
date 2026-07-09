const compactCurrencyFormatter = new Intl.NumberFormat("en-UG", {
  currency: "UGX",
  maximumFractionDigits: 1,
  notation: "compact",
  style: "currency",
})

const dateFormatter = new Intl.DateTimeFormat("en-UG", {
  day: "numeric",
  month: "short",
})

export function formatCurrency(amount: number) {
  return compactCurrencyFormatter.format(amount).replace("UGX", "UGX ")
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

export function formatShortDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00`))
}
