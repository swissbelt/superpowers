import type { AppData, ProductivityLibrary, Settings } from '../types'

export function downloadJson(data: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export interface SettingsExport {
  settings: Settings
  productivity: ProductivityLibrary
}

export function exportSettingsJson(settings: Settings, productivity: ProductivityLibrary) {
  downloadJson({ settings, productivity }, 'benchmark-settings.json')
}

export function exportFullBackupJson(data: AppData) {
  downloadJson(data, 'benchmark-rate-sheet-backup.json')
}

function isRecordOfNumbers(value: unknown): value is Record<string, number> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((v) => typeof v === 'number')
  )
}

export function parseSettingsJson(text: string): SettingsExport {
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid settings file: not a JSON object')
  }
  const { settings, productivity } = parsed as Partial<SettingsExport>
  if (!settings || typeof settings !== 'object') {
    throw new Error('Invalid settings file: missing "settings"')
  }
  if (!productivity || !isRecordOfNumbers(productivity)) {
    throw new Error('Invalid settings file: missing or malformed "productivity"')
  }
  return { settings: settings as Settings, productivity: productivity as ProductivityLibrary }
}

export function parseFullBackupJson(text: string): AppData {
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup file: not a JSON object')
  }
  const data = parsed as Partial<AppData>
  if (!data.settings || !data.productivity || !data.currentInputs) {
    throw new Error('Invalid backup file: missing required fields')
  }
  return {
    settings: data.settings,
    productivity: data.productivity,
    currentInputs: data.currentInputs,
    scenarios: data.scenarios ?? [],
    bids: data.bids ?? [],
    theme: data.theme === 'dark' ? 'dark' : 'light',
  }
}
