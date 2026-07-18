const standardCurrencyFormatter = new Intl.NumberFormat("en-UG", {
  currency: "UGX",
  maximumFractionDigits: 0,
  style: "currency",
})

const dateFormatter = new Intl.DateTimeFormat("en-UG", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function formatCurrency(amount: number) {
  return standardCurrencyFormatter.format(amount).replace("UGX", "USh ")
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

export function formatShortDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00`))
}
