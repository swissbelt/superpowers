import { useAppState } from '../../context/AppStateContext'
import { BUILDING_TYPE_LABELS, type BuildingType } from '../../types'
import { Slider } from '../inputs/Slider'
import { DEFAULT_PRODUCTIVITY } from '../../data/defaults'
import { RotateCcw, Gauge } from 'lucide-react'

export function ProductivityLibraryPage() {
  const { data, setProductivity } = useAppState()

  const update = (buildingType: BuildingType, value: number) =>
    setProductivity((prev) => ({ ...prev, [buildingType]: value }))

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Productivity Library
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sq ft / hour cleaning rates by building type. Changes apply to every future estimate
            that uses the library.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Reset all productivity rates to defaults?')) setProductivity(() => DEFAULT_PRODUCTIVITY)
          }}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <RotateCcw size={15} /> Reset to Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(BUILDING_TYPE_LABELS) as BuildingType[]).map((type) => (
          <div
            key={type}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Gauge size={16} className="text-indigo-500" />
              {BUILDING_TYPE_LABELS[type]}
            </div>
            <Slider
              label="Sq Ft / Hour"
              value={data.productivity[type]}
              min={500}
              max={8000}
              step={50}
              onChange={(v) => update(type, v)}
              formatValue={(v) => v.toLocaleString()}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
