import { useMemo } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { computeBuildingTypeInsights } from '../../lib/pricingInsights'
import { BUILDING_TYPE_LABELS } from '../../types'
import { formatCurrency, formatPercent } from '../../lib/format'
import { TrendingUp } from 'lucide-react'

export function PricingInsights() {
  const { data } = useAppState()
  const insights = useMemo(() => computeBuildingTypeInsights(data.bids), [data.bids])

  if (insights.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <TrendingUp size={15} className="text-indigo-500" />
        Pricing Insights by Building Type
      </h3>
      <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
        Descriptive stats from your own logged bids — not a prediction, just what's actually won
        and lost so far.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-400 uppercase">
            <tr>
              <th className="py-1.5 pr-4">Building Type</th>
              <th className="py-1.5 pr-4">Win Rate</th>
              <th className="py-1.5 pr-4">Avg Margin</th>
              <th className="py-1.5 pr-4">Won Price / Sq Ft (min–median–max)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {insights.map((insight) => (
              <tr key={insight.buildingType}>
                <td className="py-1.5 pr-4 font-medium text-slate-700 dark:text-slate-200">
                  {BUILDING_TYPE_LABELS[insight.buildingType]}
                </td>
                <td className="py-1.5 pr-4 font-mono">
                  {formatPercent(insight.winRate, 0)}{' '}
                  <span className="text-xs text-slate-400">
                    ({insight.wonCount}W/{insight.lostCount}L)
                  </span>
                </td>
                <td className="py-1.5 pr-4 font-mono text-emerald-600 dark:text-emerald-400">
                  {insight.wonCount > 0 ? formatPercent(insight.avgMarginPercent) : '—'}
                </td>
                <td className="py-1.5 pr-4 font-mono">
                  {insight.wonCount > 0
                    ? `${formatCurrency(insight.minPricePerSqFt, 3)} – ${formatCurrency(insight.medianPricePerSqFt, 3)} – ${formatCurrency(insight.maxPricePerSqFt, 3)}`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
