import { useAppState } from '../../context/AppStateContext'
import { formatCurrency, formatPercent } from '../../lib/format'
import { exportScenarioWorkbook } from '../../lib/exportExcel'
import { Trash2, Upload, FileSpreadsheet, GitCompareArrows } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ScenariosPageProps {
  onOpenEstimator?: () => void
}

const CHART_COLORS = {
  cost: '#94a3b8',
  price: '#6366f1',
  profit: '#10b981',
}

export function ScenariosPage({ onOpenEstimator }: ScenariosPageProps) {
  const { data, removeScenario, loadScenario } = useAppState()
  const scenarios = data.scenarios

  const chartData = scenarios.map((s) => ({
    name: s.label,
    Cost: Number(s.results.totalOperatingCostPerVisit.toFixed(2)),
    Price: Number(s.results.recommendedPricePerVisit.toFixed(2)),
    Profit: Number(s.results.profitPerVisit.toFixed(2)),
  }))

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Scenario Comparison
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Save estimates from the Estimator tab, then compare them side by side.
          </p>
        </div>
        <button
          onClick={() => exportScenarioWorkbook(data)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <FileSpreadsheet size={15} /> Export Excel
        </button>
      </div>

      {scenarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <GitCompareArrows size={32} className="mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            No scenarios saved yet
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Build an estimate and click "Save" to add it here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((s) => (
              <div
                key={s.id}
                className="animate-fade-in rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{s.label}</h3>
                  <button
                    onClick={() => removeScenario(s.id)}
                    className="text-slate-300 transition-colors hover:text-rose-500 dark:text-slate-600"
                    aria-label={`Delete ${s.label}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
                  {s.inputs.customer.name || 'Unnamed customer'} ·{' '}
                  {s.inputs.squareFootage.toLocaleString()} sq ft
                </p>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Price / Visit</dt>
                    <dd className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(s.results.recommendedPricePerVisit)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Cost / Visit</dt>
                    <dd className="font-mono text-slate-600 dark:text-slate-300">
                      {formatCurrency(s.results.totalOperatingCostPerVisit)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Profit / Visit</dt>
                    <dd className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(s.results.profitPerVisit)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Margin</dt>
                    <dd className="font-mono text-slate-600 dark:text-slate-300">
                      {formatPercent(s.results.grossMarginPercent)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Annual Revenue</dt>
                    <dd className="font-mono text-slate-600 dark:text-slate-300">
                      {formatCurrency(s.results.annualRevenue, 0)}
                    </dd>
                  </div>
                </dl>
                <button
                  onClick={() => {
                    loadScenario(s.id)
                    onOpenEstimator?.()
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
                >
                  <Upload size={13} /> Load into Estimator
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Cost / Price / Profit by Scenario
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatCurrency(Number(Array.isArray(v) ? v[0] : v))} />
                <Legend />
                <Bar dataKey="Cost" fill={CHART_COLORS.cost} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Price" fill={CHART_COLORS.price} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Profit" fill={CHART_COLORS.profit} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-400 uppercase dark:bg-slate-800/60">
                <tr>
                  <th className="px-4 py-3">Scenario</th>
                  <th className="px-4 py-3">Price / Visit</th>
                  <th className="px-4 py-3">Cost / Visit</th>
                  <th className="px-4 py-3">Profit / Visit</th>
                  <th className="px-4 py-3">Margin</th>
                  <th className="px-4 py-3">Monthly Revenue</th>
                  <th className="px-4 py-3">Annual Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {scenarios.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">
                      {s.label}
                    </td>
                    <td className="px-4 py-2.5 font-mono">
                      {formatCurrency(s.results.recommendedPricePerVisit)}
                    </td>
                    <td className="px-4 py-2.5 font-mono">
                      {formatCurrency(s.results.totalOperatingCostPerVisit)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(s.results.profitPerVisit)}
                    </td>
                    <td className="px-4 py-2.5 font-mono">
                      {formatPercent(s.results.grossMarginPercent)}
                    </td>
                    <td className="px-4 py-2.5 font-mono">
                      {formatCurrency(s.results.monthlyRevenue, 0)}
                    </td>
                    <td className="px-4 py-2.5 font-mono">
                      {formatCurrency(s.results.annualRevenue, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
