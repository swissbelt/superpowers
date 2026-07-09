interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  formatValue?: (value: number) => string
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  formatValue,
}: SliderProps) {
  const display = formatValue
    ? formatValue(value)
    : `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`

  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
        <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
      />
    </label>
  )
}
