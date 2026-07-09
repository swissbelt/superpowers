import type { Bid, BuildingType } from '../types'

export interface BuildingTypeInsight {
  buildingType: BuildingType
  wonCount: number
  lostCount: number
  winRate: number
  avgMarginPercent: number
  minPricePerSqFt: number
  medianPricePerSqFt: number
  maxPricePerSqFt: number
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/**
 * Descriptive statistics over logged bid history, grouped by building type —
 * not a predictive or machine-learning model, just aggregates of what you've
 * actually won and lost so far.
 */
export function computeBuildingTypeInsights(bids: Bid[]): BuildingTypeInsight[] {
  const byType = new Map<BuildingType, Bid[]>()
  for (const bid of bids) {
    if (!bid.buildingType) continue
    const list = byType.get(bid.buildingType) ?? []
    list.push(bid)
    byType.set(bid.buildingType, list)
  }

  const insights: BuildingTypeInsight[] = []
  for (const [buildingType, typeBids] of byType) {
    const won = typeBids.filter((b) => b.status === 'Won')
    const lost = typeBids.filter((b) => b.status === 'Lost')
    const decided = won.length + lost.length

    const wonWithSqFt = won.filter((b) => b.squareFootage > 0 && b.finalPrice > 0)
    const pricesPerSqFt = wonWithSqFt.map((b) => b.finalPrice / b.squareFootage)
    const wonWithPrice = won.filter((b) => b.finalPrice > 0)
    const avgMarginPercent =
      wonWithPrice.length > 0
        ? (wonWithPrice.reduce((sum, b) => sum + b.profit / b.finalPrice, 0) / wonWithPrice.length) * 100
        : 0

    insights.push({
      buildingType,
      wonCount: won.length,
      lostCount: lost.length,
      winRate: decided > 0 ? (won.length / decided) * 100 : 0,
      avgMarginPercent,
      minPricePerSqFt: pricesPerSqFt.length ? Math.min(...pricesPerSqFt) : 0,
      medianPricePerSqFt: median(pricesPerSqFt),
      maxPricePerSqFt: pricesPerSqFt.length ? Math.max(...pricesPerSqFt) : 0,
    })
  }

  return insights.sort((a, b) => b.avgMarginPercent - a.avgMarginPercent)
}
