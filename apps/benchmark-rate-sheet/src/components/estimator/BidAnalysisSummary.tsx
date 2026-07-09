import { useAppState } from '../../context/AppStateContext'
import { FREQUENCY_LABELS } from '../../types'
import { formatCurrency, formatPercent } from '../../lib/format'
import { Sparkles, AlertTriangle } from 'lucide-react'

export function BidAnalysisSummary() {
  const { data, results } = useAppState()
  const inputs = data.currentInputs
  const riskNotes = data.riskNotes ?? []

  const laborHoursPerWeek = results.laborHoursPerVisit * (results.visitsPerMonth / 4.345)

  const allRisks = [
    ...riskNotes,
    ...(results.priceFloorApplied ? ['Price floor applied — true margin is below target'] : []),
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <Sparkles size={15} className="text-indigo-500" />
        Bid Analysis Summary
      </h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-slate-400 uppercase">Facility</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">
            {inputs.building.name || 'Not specified'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase">Estimated Size</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">
            {inputs.squareFootage.toLocaleString()} sq ft
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase">Cleaning Frequency</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">
            {FREQUENCY_LABELS[inputs.frequency]}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase">Estimated Labor</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">
            {laborHoursPerWeek.toFixed(1)} labor hours/week
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase">Estimated Monthly Cost</dt>
          <dd className="font-medium text-slate-700 dark:text-slate-200">
            {formatCurrency(results.monthlyCost, 0)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase">Recommended Bid</dt>
          <dd className="font-semibold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(results.monthlyRevenue, 0)}/month
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase">Expected Margin</dt>
          <dd className="font-medium text-emerald-600 dark:text-emerald-400">
            {formatPercent(results.grossMarginPercent)}
          </dd>
        </div>
      </dl>

      {allRisks.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-amber-600 uppercase dark:text-amber-400">
            <AlertTriangle size={13} /> Risk Factors
          </p>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {allRisks.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
