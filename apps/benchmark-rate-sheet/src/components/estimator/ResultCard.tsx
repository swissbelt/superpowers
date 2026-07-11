import type { ReactNode } from 'react'

interface ResultCardProps {
  label: string
  value: string
  icon?: ReactNode
  tone?: 'default' | 'positive' | 'negative' | 'accent'
  sub?: string
}

const toneClasses: Record<NonNullable<ResultCardProps['tone']>, string> = {
  default: 'text-slate-800 dark:text-slate-100',
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-rose-600 dark:text-rose-400',
  accent: 'text-indigo-600 dark:text-indigo-400',
}

export function ResultCard({ label, value, icon, tone = 'default', sub }: ResultCardProps) {
  return (
    <div className="animate-fade-in rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide text-slate-400 uppercase dark:text-slate-500">
          {label}
        </p>
        {icon && <span className="text-slate-300 dark:text-slate-600">{icon}</span>}
      </div>
      <p className={`mt-1.5 text-2xl font-semibold tabular-nums ${toneClasses[tone]}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
    </div>
  )
}
