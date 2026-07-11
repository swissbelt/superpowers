import { useRef, useState } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { NumberField } from '../inputs/NumberField'
import { Switch } from '../inputs/Switch'
import { Section } from '../inputs/Section'
import {
  exportFullBackupJson,
  exportSettingsJson,
  parseFullBackupJson,
  parseSettingsJson,
} from '../../lib/exportJson'
import { Download, Upload, AlertCircle, CheckCircle2 } from 'lucide-react'

export function SettingsPage() {
  const { data, setSettings, setProductivity, replaceData } = useAppState()
  const settings = data.settings
  const settingsFileRef = useRef<HTMLInputElement>(null)
  const backupFileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const update = (patch: Partial<typeof settings>) => setSettings((prev) => ({ ...prev, ...patch }))

  const flash = (type: 'ok' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3500)
  }

  const handleImportSettings = async (file: File) => {
    try {
      const text = await file.text()
      const { settings: importedSettings, productivity } = parseSettingsJson(text)
      setSettings(() => importedSettings)
      setProductivity(() => productivity)
      flash('ok', 'Settings imported successfully.')
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to import settings file.')
    }
  }

  const handleImportBackup = async (file: File) => {
    try {
      const text = await file.text()
      const parsed = parseFullBackupJson(text)
      replaceData(parsed)
      flash('ok', 'Full backup restored successfully.')
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to import backup file.')
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Global rate assumptions used across every estimate.
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            message.type === 'ok'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
          }`}
        >
          {message.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      <Section title="Labor & Payroll">
        <NumberField
          label="Labor Burden %"
          value={settings.laborBurdenPercent}
          min={0}
          step={0.5}
          suffix="%"
          onChange={(v) => update({ laborBurdenPercent: v })}
        />
        <NumberField
          label="Workers' Compensation %"
          value={settings.workersCompPercent}
          min={0}
          step={0.5}
          suffix="%"
          onChange={(v) => update({ workersCompPercent: v })}
        />
        <NumberField
          label="Payroll Tax %"
          value={settings.payrollTaxPercent}
          min={0}
          step={0.05}
          suffix="%"
          onChange={(v) => update({ payrollTaxPercent: v })}
        />
      </Section>

      <Section title="Insurance & Travel">
        <NumberField
          label="Base Monthly Insurance Cost"
          value={settings.insuranceCostMonthly}
          min={0}
          prefix="$"
          onChange={(v) => update({ insuranceCostMonthly: v })}
        />
        <NumberField
          label="Fuel Cost Per Gallon"
          value={settings.fuelCostPerGallon}
          min={0}
          step={0.05}
          prefix="$"
          onChange={(v) => update({ fuelCostPerGallon: v })}
        />
        <NumberField
          label="Mileage Reimbursement Rate"
          value={settings.mileageReimbursementRate}
          min={0}
          step={0.01}
          prefix="$"
          suffix="/ mi"
          onChange={(v) => update({ mileageReimbursementRate: v })}
        />
      </Section>

      <Section title="Overhead & Fees">
        <NumberField
          label="Overhead %"
          value={settings.overheadPercent}
          min={0}
          step={0.5}
          suffix="%"
          onChange={(v) => update({ overheadPercent: v })}
        />
        <NumberField
          label="eVA Fee Cap"
          value={settings.evaFeeCapDollar}
          min={0}
          prefix="$"
          onChange={(v) => update({ evaFeeCapDollar: v })}
        />
        <NumberField
          label="Default Profit Margin %"
          value={settings.defaultProfitMarginPercent}
          min={0}
          max={100}
          suffix="%"
          onChange={(v) => update({ defaultProfitMarginPercent: v })}
        />
        <Switch
          label="SWaM Certified Status"
          description="Small, Women-Owned, and Minority-Owned business designation"
          checked={settings.swamStatus}
          onChange={(v) => update({ swamStatus: v })}
        />
      </Section>

      <Section title="Import / Export">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Settings & Productivity Library
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => exportSettingsJson(settings, data.productivity)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Download size={14} /> Export JSON
              </button>
              <button
                onClick={() => settingsFileRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Upload size={14} /> Import JSON
              </button>
              <input
                ref={settingsFileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImportSettings(file)
                  e.target.value = ''
                }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              Full App Backup (scenarios, bids, settings)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => exportFullBackupJson(data)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Download size={14} /> Export JSON
              </button>
              <button
                onClick={() => backupFileRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Upload size={14} /> Import JSON
              </button>
              <input
                ref={backupFileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImportBackup(file)
                  e.target.value = ''
                }}
              />
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
