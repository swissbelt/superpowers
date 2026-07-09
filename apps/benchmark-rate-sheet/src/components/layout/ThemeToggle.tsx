import { Moon, Sun } from 'lucide-react'
import { useAppState } from '../../context/AppStateContext'

export function ThemeToggle() {
  const { data, setTheme } = useAppState()
  const isDark = data.theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
