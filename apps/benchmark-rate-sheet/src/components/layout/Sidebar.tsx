import {
  Calculator,
  GitCompareArrows,
  History,
  Gauge,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react'
import type { ReactNode } from 'react'

export type Page = 'estimator' | 'scenarios' | 'history' | 'productivity' | 'settings'

const NAV_ITEMS: { id: Page; label: string; icon: ReactNode }[] = [
  { id: 'estimator', label: 'Estimator', icon: <Calculator size={18} /> },
  { id: 'scenarios', label: 'Scenarios', icon: <GitCompareArrows size={18} /> },
  { id: 'history', label: 'Bid History', icon: <History size={18} /> },
  { id: 'productivity', label: 'Productivity Library', icon: <Gauge size={18} /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
]

interface SidebarProps {
  page: Page
  onNavigate: (page: Page) => void
}

export function Sidebar({ page, onNavigate }: SidebarProps) {
  return (
    <aside className="no-print flex w-full shrink-0 flex-col border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:h-screen lg:w-60 lg:border-r">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-sm leading-tight font-bold text-slate-900 dark:text-white">
            Benchmark
          </p>
          <p className="text-xs leading-tight text-slate-400">Contract Services</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              page === item.id
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
