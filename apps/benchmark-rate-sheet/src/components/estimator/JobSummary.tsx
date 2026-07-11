import { useAppState } from '../../context/AppStateContext'
import { generateJobSummary } from '../../lib/jobSummary'
import { ClipboardCheck } from 'lucide-react'

export function JobSummary() {
  const { data } = useAppState()
  const summary = generateJobSummary(data.currentInputs, data.scopeNotes ?? [])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <ClipboardCheck size={15} className="text-indigo-500" />
        Job Summary
      </h3>
      <p className="text-sm text-slate-700 dark:text-slate-200">{summary.headline}</p>
      {summary.bullets.length > 0 && (
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-500 dark:text-slate-400">
          {summary.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
