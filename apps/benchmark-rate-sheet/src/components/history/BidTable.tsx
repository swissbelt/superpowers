import { useAppState } from '../../context/AppStateContext'
import { BUILDING_TYPE_LABELS, FREQUENCY_LABELS, type BidStatus } from '../../types'
import { formatCurrency } from '../../lib/format'
import { Trash2 } from 'lucide-react'

const STATUS_STYLES: Record<BidStatus, string> = {
  Won: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Lost: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
}

export function BidTable() {
  const { data, removeBid } = useAppState()

  if (data.bids.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
        No bids logged yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-400 uppercase dark:bg-slate-800/60">
          <tr>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Agency</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Sq Ft</th>
            <th className="px-4 py-3">Building Type</th>
            <th className="px-4 py-3">Frequency</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Cost</th>
            <th className="px-4 py-3">Profit</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Notes</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.bids.map((b) => (
            <tr key={b.id}>
              <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{b.customer}</td>
              <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{b.agency}</td>
              <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{b.date}</td>
              <td className="px-4 py-2.5 font-mono">{b.squareFootage.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                {b.buildingType ? BUILDING_TYPE_LABELS[b.buildingType] : '—'}
              </td>
              <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                {FREQUENCY_LABELS[b.frequency]}
              </td>
              <td className="px-4 py-2.5 font-mono">{formatCurrency(b.finalPrice)}</td>
              <td className="px-4 py-2.5 font-mono">{formatCurrency(b.cost)}</td>
              <td className={`px-4 py-2.5 font-mono ${b.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {formatCurrency(b.profit)}
              </td>
              <td className="px-4 py-2.5">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[b.status]}`}>
                  {b.status}
                </span>
              </td>
              <td className="max-w-[160px] truncate px-4 py-2.5 text-slate-400" title={b.notes}>
                {b.notes}
              </td>
              <td className="px-4 py-2.5">
                <button
                  onClick={() => removeBid(b.id)}
                  className="text-slate-300 transition-colors hover:text-rose-500 dark:text-slate-600"
                  aria-label={`Delete bid for ${b.customer}`}
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
