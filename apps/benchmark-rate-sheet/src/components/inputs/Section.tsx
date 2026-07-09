import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface SectionProps {
  title: string
  icon?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

export function Section({ title, icon, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {icon}
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="animate-fade-in space-y-4 border-t border-slate-100 px-4 py-4 dark:border-slate-800">
          {children}
        </div>
      )}
    </div>
  )
}
