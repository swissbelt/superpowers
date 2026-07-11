import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  DEFAULT_PRODUCTIVITY,
  DEFAULT_SETTINGS,
  defaultEstimateInputs,
} from '../data/defaults'
import { calculateEstimate } from '../lib/calculations'
import { genId } from '../lib/format'
import type {
  AppData,
  Bid,
  EstimateInputs,
  EstimateResults,
  ProductivityLibrary,
  Scenario,
  Settings,
} from '../types'

const STORAGE_KEY = 'benchmark-rate-sheet:v1'

function defaultAppData(): AppData {
  return {
    settings: DEFAULT_SETTINGS,
    productivity: DEFAULT_PRODUCTIVITY,
    currentInputs: defaultEstimateInputs(),
    scenarios: [],
    bids: [],
    theme: 'light',
    riskNotes: [],
    scopeNotes: [],
  }
}

interface AppStateValue {
  data: AppData
  results: EstimateResults
  setCurrentInputs: (updater: (prev: EstimateInputs) => EstimateInputs) => void
  resetCurrentInputs: () => void
  setSettings: (updater: (prev: Settings) => Settings) => void
  setProductivity: (updater: (prev: ProductivityLibrary) => ProductivityLibrary) => void
  saveScenario: (label: string) => void
  removeScenario: (id: string) => void
  loadScenario: (id: string) => void
  addBid: (bid: Omit<Bid, 'id'>) => void
  updateBid: (id: string, updater: (prev: Bid) => Bid) => void
  removeBid: (id: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  replaceData: (data: AppData) => void
  setRiskNotes: (notes: string[]) => void
  setScopeNotes: (notes: string[]) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useLocalStorage<AppData>(STORAGE_KEY, defaultAppData())

  useEffect(() => {
    const root = document.documentElement
    if (data.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [data.theme])

  const results = useMemo(
    () => calculateEstimate(data.currentInputs, data.settings, data.productivity),
    [data.currentInputs, data.settings, data.productivity],
  )

  const value: AppStateValue = {
    data,
    results,
    setCurrentInputs: (updater) =>
      setData((prev) => ({ ...prev, currentInputs: updater(prev.currentInputs) })),
    resetCurrentInputs: () =>
      setData((prev) => ({
        ...prev,
        currentInputs: defaultEstimateInputs(),
        riskNotes: [],
        scopeNotes: [],
      })),
    setSettings: (updater) =>
      setData((prev) => ({ ...prev, settings: updater(prev.settings) })),
    setProductivity: (updater) =>
      setData((prev) => ({ ...prev, productivity: updater(prev.productivity) })),
    saveScenario: (label) =>
      setData((prev) => {
        const scenarioResults = calculateEstimate(
          prev.currentInputs,
          prev.settings,
          prev.productivity,
        )
        const scenario: Scenario = {
          id: genId(),
          label,
          createdAt: new Date().toISOString(),
          inputs: prev.currentInputs,
          results: scenarioResults,
        }
        return { ...prev, scenarios: [...prev.scenarios, scenario] }
      }),
    removeScenario: (id) =>
      setData((prev) => ({
        ...prev,
        scenarios: prev.scenarios.filter((s) => s.id !== id),
      })),
    loadScenario: (id) =>
      setData((prev) => {
        const scenario = prev.scenarios.find((s) => s.id === id)
        if (!scenario) return prev
        return { ...prev, currentInputs: scenario.inputs }
      }),
    addBid: (bid) =>
      setData((prev) => ({
        ...prev,
        bids: [...prev.bids, { ...bid, id: genId() }],
      })),
    updateBid: (id, updater) =>
      setData((prev) => ({
        ...prev,
        bids: prev.bids.map((b) => (b.id === id ? updater(b) : b)),
      })),
    removeBid: (id) =>
      setData((prev) => ({ ...prev, bids: prev.bids.filter((b) => b.id !== id) })),
    setTheme: (theme) => setData((prev) => ({ ...prev, theme })),
    replaceData: (next) => setData(next),
    setRiskNotes: (notes) => setData((prev) => ({ ...prev, riskNotes: notes })),
    setScopeNotes: (notes) => setData((prev) => ({ ...prev, scopeNotes: notes })),
  }

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  )
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
