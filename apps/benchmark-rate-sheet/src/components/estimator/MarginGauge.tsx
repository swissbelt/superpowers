interface MarginGaugeProps {
  marginPercent: number
  targetPercent: number
}

/** Semi-circular gauge showing gross margin against the desired target. */
export function MarginGauge({ marginPercent, targetPercent }: MarginGaugeProps) {
  const clamped = Math.max(0, Math.min(100, marginPercent))
  const radius = 70
  const circumference = Math.PI * radius
  const offset = circumference * (1 - clamped / 100)

  const color =
    marginPercent < 0
      ? 'stroke-rose-500'
      : marginPercent < targetPercent - 5
        ? 'stroke-amber-500'
        : 'stroke-emerald-500'

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 160 90" className="w-full max-w-[220px]">
        <path
          d="M 10 80 A 70 70 0 0 1 150 80"
          fill="none"
          strokeWidth={14}
          strokeLinecap="round"
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        <path
          d="M 10 80 A 70 70 0 0 1 150 80"
          fill="none"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-all duration-500 ease-out ${color}`}
        />
      </svg>
      <p className="-mt-8 text-3xl font-bold text-slate-800 dark:text-slate-100">
        {marginPercent.toFixed(1)}%
      </p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        Gross Margin &middot; Target {targetPercent}%
      </p>
    </div>
  )
}
