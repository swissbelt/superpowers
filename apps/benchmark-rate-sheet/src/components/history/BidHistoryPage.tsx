import { useAppState } from '../../context/AppStateContext'
import { BidForm } from './BidForm'
import { BidTable } from './BidTable'
import { BidCharts } from './BidCharts'
import { PricingInsights } from './PricingInsights'
import { exportBidHistoryWorkbook } from '../../lib/exportExcel'
import { FileSpreadsheet } from 'lucide-react'

export function BidHistoryPage() {
  const { data } = useAppState()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Historical Bid Database
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track past bids and see how your pricing performs over time.
          </p>
        </div>
        <button
          onClick={() => exportBidHistoryWorkbook(data)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <FileSpreadsheet size={15} /> Export Excel
        </button>
      </div>

      <BidCharts />
      <PricingInsights />
      <BidForm />
      <BidTable />
    </div>
  )
}
