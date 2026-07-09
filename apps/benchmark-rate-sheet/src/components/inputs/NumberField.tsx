interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
}: NumberFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      <div className="flex items-center overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800">
        {prefix && (
          <span className="pl-3 text-sm text-slate-400 select-none">{prefix}</span>
        )}
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.valueAsNumber || 0)}
          className="w-full min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none dark:text-slate-100"
        />
        {suffix && (
          <span className="pr-3 text-sm text-slate-400 select-none">{suffix}</span>
        )}
      </div>
    </label>
  )
}
