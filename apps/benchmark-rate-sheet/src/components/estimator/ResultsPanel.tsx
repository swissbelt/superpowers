import { useState } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { ResultCard } from './ResultCard'
import { MarginGauge } from './MarginGauge'
import { ProgressBar } from './ProgressBar'
import { BidAnalysisSummary } from './BidAnalysisSummary'
import { JobSummary } from './JobSummary'
import { computeBuildingTypeInsights } from '../../lib/pricingInsights'
import { formatCurrency, formatNumber, formatPercent } from '../../lib/format'
import {
  Clock,
  HardHat,
  Car,
  SprayCan,
  ShieldCheck,
  BadgeCheck,
  Landmark,
  Wallet,
  Tag,
  TrendingUp,
  PieChart,
  CalendarDays,
  CalendarRange,
  Ruler,
  AlertTriangle,
} from 'lucide-react'

export function ResultsPanel() {
  const { data, results, saveScenario } = useAppState()
  const [scenarioName, setScenarioName] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)

  const nextScenarioLetter = String.fromCharCode(65 + (data.scenarios.length % 26))

  const historicalInsight = computeBuildingTypeInsights(data.bids).find(
    (i) => i.buildingType === data.currentInputs.building.buildingType && i.wonCount > 0,
  )

  const handleSave = () => {
    const label = scenarioName.trim() || `Scenario ${nextScenarioLetter}`
    saveScenario(label)
    setScenarioName('')
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1500)
  }

  const costBreakdown = [
    { label: 'Labor', value: results.laborCostPerVisit, color: 'bg-indigo-600' },
    { label: 'Travel', value: results.travelCostPerVisit, color: 'bg-sky-500' },
    { label: 'Supplies', value: results.suppliesCostPerVisit, color: 'bg-teal-500' },
    { label: 'Specialty Services', value: results.specialtyCostPerVisit, color: 'bg-fuchsia-500' },
    { label: 'Insurance', value: results.insuranceAllocationPerVisit, color: 'bg-amber-500' },
    { label: 'Background Checks', value: results.backgroundCheckCostPerVisit, color: 'bg-rose-500' },
    { label: 'Overhead', value: results.overheadPerVisit, color: 'bg-slate-400' },
    { label: 'eVA Fee', value: results.evaFeePerVisit, color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm dark:border-slate-800 dark:from-indigo-500/10 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">
              Recommended Selling Price
            </p>
            <p className="mt-1 text-4xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(results.recommendedPricePerVisit)}
              <span className="ml-1 text-base font-normal text-slate-400">/ visit</span>
            </p>
            {results.priceFloorApplied && (
              <p className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-amber-600 sm:justify-start dark:text-amber-400">
                <AlertTriangle size={13} /> Price floor applied
              </p>
            )}
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Profit / visit:{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(results.profitPerVisit)}
              </span>
            </p>
            {historicalInsight && (
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Your past won bids for this building type priced{' '}
                {formatCurrency(historicalInsight.minPricePerSqFt, 3)}–
                {formatCurrency(historicalInsight.maxPricePerSqFt, 3)}/sq ft — this estimate is{' '}
                {formatCurrency(results.pricePerSquareFoot, 3)}/sq ft.
              </p>
            )}
          </div>
          <MarginGauge
            marginPercent={results.grossMarginPercent}
            targetPercent={data.currentInputs.desiredProfitMarginPercent}
          />
        </div>
      </div>

      <JobSummary />

      <BidAnalysisSummary />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ResultCard
          label="Labor Hours"
          value={formatNumber(results.laborHoursPerVisit, 2)}
          icon={<Clock size={16} />}
          sub="per visit"
        />
        <ResultCard
          label="Labor Cost"
          value={formatCurrency(results.laborCostPerVisit)}
          icon={<HardHat size={16} />}
          sub="per visit"
        />
        <ResultCard
          label="Travel Cost"
          value={formatCurrency(results.travelCostPerVisit)}
          icon={<Car size={16} />}
          sub="per visit"
        />
        <ResultCard
          label="Supplies Cost"
          value={formatCurrency(results.suppliesCostPerVisit)}
          icon={<SprayCan size={16} />}
          sub="per visit"
        />
        <ResultCard
          label="Insurance Allocation"
          value={formatCurrency(results.insuranceAllocationPerVisit)}
          icon={<ShieldCheck size={16} />}
          sub="per visit"
        />
        <ResultCard
          label="Background Checks"
          value={formatCurrency(results.backgroundCheckCostPerVisit)}
          icon={<BadgeCheck size={16} />}
          sub="per visit"
        />
        <ResultCard
          label="eVA Fee"
          value={formatCurrency(results.evaFeePerVisit)}
          icon={<Landmark size={16} />}
          sub="per visit"
        />
        <ResultCard
          label="Total Operating Cost"
          value={formatCurrency(results.totalOperatingCostPerVisit)}
          icon={<Wallet size={16} />}
          tone="negative"
          sub="per visit"
        />
        <ResultCard
          label="Price Per Visit"
          value={formatCurrency(results.recommendedPricePerVisit)}
          icon={<Tag size={16} />}
          tone="accent"
        />
        <ResultCard
          label="Profit"
          value={formatCurrency(results.profitPerVisit)}
          icon={<TrendingUp size={16} />}
          tone="positive"
          sub="per visit"
        />
        <ResultCard
          label="Gross Margin"
          value={formatPercent(results.grossMarginPercent)}
          icon={<PieChart size={16} />}
          tone="positive"
        />
        <ResultCard
          label="Monthly Revenue"
          value={formatCurrency(results.monthlyRevenue, 0)}
          icon={<CalendarDays size={16} />}
        />
        <ResultCard
          label="Annual Revenue"
          value={formatCurrency(results.annualRevenue, 0)}
          icon={<CalendarRange size={16} />}
        />
        <ResultCard
          label="Cost / Sq Ft"
          value={formatCurrency(results.costPerSquareFoot, 4)}
          icon={<Ruler size={16} />}
        />
        <ResultCard
          label="Price / Sq Ft"
          value={formatCurrency(results.pricePerSquareFoot, 4)}
          icon={<Ruler size={16} />}
          tone="accent"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Cost Breakdown / Visit
        </h3>
        <div className="space-y-3">
          {costBreakdown.map((item) => (
            <ProgressBar
              key={item.label}
              label={item.label}
              value={item.value}
              max={results.totalOperatingCostPerVisit || 1}
              formatValue={(v) => formatCurrency(v)}
              color={item.color}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Save as Scenario
        </h3>
        <div className="flex gap-2">
          <input
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder={`Scenario ${nextScenarioLetter}`}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            onClick={handleSave}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            {savedFlash ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
