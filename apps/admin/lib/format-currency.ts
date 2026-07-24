export function formatCompactCurrency(
  amountCents: number,
  currency = "UGX"
): string {
  const amount = amountCents / 100
  if (Math.abs(amount) >= 1_000_000_000) {
    const formatted = (amount / 1_000_000_000).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    })
    return `${currency} ${formatted}B`
  }
  if (Math.abs(amount) >= 1_000_000) {
    const formatted = (amount / 1_000_000).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    })
    return `${currency} ${formatted}M`
  }
  if (Math.abs(amount) >= 1_000) {
    const formatted = (amount / 1_000).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    return `${currency} ${formatted}K`
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

export function formatCreatedDate(dateInput: Date | string): string {
  const d = new Date(dateInput)
  const day = d.getDate()
  const month = d.toLocaleDateString("en-US", { month: "long" })
  const year = d.getFullYear()

  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`
}
