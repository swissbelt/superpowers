import { useMemo } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { formatCurrency, formatPercent } from '../../lib/format'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const WIN_COLORS = ['#10b981', '#ef4444']

export function BidCharts() {
  const { data } = useAppState()
  const bids = data.bids

  const stats = useMemo(() => {
    const won = bids.filter((b) => b.status === 'Won').length
    const lost = bids.filter((b) => b.status === 'Lost').length
    const decided = won + lost
    const winRate = decided > 0 ? (won / decided) * 100 : 0

    const withPrice = bids.filter((b) => b.finalPrice > 0)
    const avgMargin =
      withPrice.length > 0
        ? withPrice.reduce((sum, b) => sum + (b.profit / b.finalPrice) * 100, 0) / withPrice.length
        : 0

    const withSqFt = bids.filter((b) => b.squareFootage > 0)
    const avgPricePerSqFt =
      withSqFt.length > 0
        ? withSqFt.reduce((sum, b) => sum + b.finalPrice / b.squareFootage, 0) / withSqFt.length
        : 0

    const revenueByCustomerMap = new Map<string, number>()
    for (const b of bids) {
      const key = b.customer || 'Unknown'
      revenueByCustomerMap.set(key, (revenueByCustomerMap.get(key) ?? 0) + b.finalPrice)
    }
    const revenueByCustomer = Array.from(revenueByCustomerMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)

    return { won, lost, winRate, avgMargin, avgPricePerSqFt, revenueByCustomer }
  }, [bids])

  const winData = [
    { name: 'Won', value: stats.won },
    { name: 'Lost', value: stats.lost },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Win Rate</h3>
        {stats.won + stats.lost === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">No decided bids yet</p>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={winData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {winData.map((entry, i) => (
                    <Cell key={entry.name} fill={WIN_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <p className="shrink-0 text-3xl font-bold text-slate-800 dark:text-slate-100">
              {formatPercent(stats.winRate, 0)}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Average Margin</p>
          <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-slate-100">
            {formatPercent(stats.avgMargin)}
          </p>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Avg Price / Sq Ft</p>
          <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-slate-100">
            {formatCurrency(stats.avgPricePerSqFt, 3)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Revenue by Customer
        </h3>
        {stats.revenueByCustomer.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">No bids logged yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.revenueByCustomer}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(Array.isArray(v) ? v[0] : v))} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
