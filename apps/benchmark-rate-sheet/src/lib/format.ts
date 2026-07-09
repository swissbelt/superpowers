export function formatCurrency(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return '$0.00'
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

export function formatPercent(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return '0%'
  return `${value.toFixed(fractionDigits)}%`
}

export function formatNumber(value: number, fractionDigits = 0): string {
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
