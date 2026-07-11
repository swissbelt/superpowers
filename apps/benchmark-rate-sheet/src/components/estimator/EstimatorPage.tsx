import { useAppState } from '../../context/AppStateContext'
import { InputsPanel } from './InputsPanel'
import { ResultsPanel } from './ResultsPanel'
import { ExportMenu } from '../export/ExportMenu'
import { ImportScopeOfWork } from './ImportScopeOfWork'
import { RotateCcw } from 'lucide-react'

export function EstimatorPage() {
  const { resetCurrentInputs } = useAppState()

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Estimate Builder</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Adjust any input and every calculation updates instantly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ImportScopeOfWork />
          <button
            onClick={() => {
              if (confirm('Reset all inputs to defaults?')) resetCurrentInputs()
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RotateCcw size={15} /> Reset
          </button>
          <ExportMenu />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <InputsPanel />
        </div>
        <div className="xl:col-span-3">
          <div className="lg:sticky lg:top-4">
            <ResultsPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
