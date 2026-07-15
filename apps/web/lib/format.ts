const standardCurrencyFormatter = new Intl.NumberFormat("en-UG", {
  currency: "UGX",
  maximumFractionDigits: 0,
  style: "currency",
})

const compactCurrencyFormatter = new Intl.NumberFormat("en-UG", {
  currency: "UGX",
  maximumFractionDigits: 2,
  notation: "compact",
  style: "currency",
})

const dateFormatter = new Intl.DateTimeFormat("en-UG", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function formatCurrency(amount: number) {
  if (Math.abs(amount) >= 1_000_000) {
    return compactCurrencyFormatter.format(amount).replace("UGX", "USh ")
  }
  return standardCurrencyFormatter.format(amount).replace("UGX", "USh ")
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

export function formatShortDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00`))
}
