interface ProgressBarProps {
  label: string
  value: number
  max: number
  formatValue: (v: number) => string
  color?: string
}

export function ProgressBar({ label, value, max, formatValue, color = 'bg-indigo-600' }: ProgressBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <span className="font-mono text-slate-600 dark:text-slate-300">{formatValue(value)}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
