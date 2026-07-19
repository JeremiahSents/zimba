type PayableLine = {
  allocation_id: string | number
  description: string
  quantity: number
  unit_amount: number
}

export function isFinitePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

export function isFiniteNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

export function hasValidPayableLines(lines: readonly PayableLine[]): boolean {
  return (
    lines.length > 0 &&
    lines.every(
      (line) =>
        isFinitePositive(Number(line.allocation_id)) &&
        line.description.trim().length > 0 &&
        isFinitePositive(line.quantity) &&
        isFiniteNonNegative(line.unit_amount)
    )
  )
}
