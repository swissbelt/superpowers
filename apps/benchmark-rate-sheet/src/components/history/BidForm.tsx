import { useState } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { TextField } from '../inputs/TextField'
import { NumberField } from '../inputs/NumberField'
import { Select } from '../inputs/Select'
import {
  BUILDING_TYPE_LABELS,
  FREQUENCY_LABELS,
  type BidStatus,
  type BuildingType,
  type CleaningFrequency,
} from '../../types'
import { Plus } from 'lucide-react'

const STATUS_OPTIONS: { value: BidStatus; label: string }[] = [
  { value: 'Won', label: 'Won' },
  { value: 'Lost', label: 'Lost' },
  { value: 'Pending', label: 'Pending' },
]

const emptyForm = {
  customer: '',
  agency: '',
  date: new Date().toISOString().slice(0, 10),
  squareFootage: 10000,
  buildingType: 'office' as BuildingType,
  frequency: '5x_week' as CleaningFrequency,
  finalPrice: 0,
  cost: 0,
  status: 'Pending' as BidStatus,
  notes: '',
}

export function BidForm() {
  const { addBid } = useAppState()
  const [form, setForm] = useState(emptyForm)

  const profit = form.finalPrice - form.cost

  const submit = () => {
    if (!form.customer.trim()) return
    addBid({ ...form, profit })
    setForm(emptyForm)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Log a Bid
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TextField label="Customer" value={form.customer} onChange={(v) => setForm({ ...form, customer: v })} />
        <TextField label="Agency" value={form.agency} onChange={(v) => setForm({ ...form, agency: v })} />
        <TextField label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
        <Select
          label="Frequency"
          value={form.frequency}
          options={Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={(v) => setForm({ ...form, frequency: v as CleaningFrequency })}
        />
        <NumberField
          label="Square Footage"
          value={form.squareFootage}
          min={0}
          onChange={(v) => setForm({ ...form, squareFootage: v })}
        />
        <Select
          label="Building Type"
          value={form.buildingType}
          options={Object.entries(BUILDING_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={(v) => setForm({ ...form, buildingType: v as BuildingType })}
        />
        <NumberField
          label="Final Price"
          value={form.finalPrice}
          min={0}
          prefix="$"
          onChange={(v) => setForm({ ...form, finalPrice: v })}
        />
        <NumberField
          label="Cost"
          value={form.cost}
          min={0}
          prefix="$"
          onChange={(v) => setForm({ ...form, cost: v })}
        />
        <Select
          label="Won / Lost"
          value={form.status}
          options={STATUS_OPTIONS}
          onChange={(v) => setForm({ ...form, status: v as BidStatus })}
        />
      </div>
      <div className="mt-3">
        <TextField label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Computed profit:{' '}
          <span className={`font-mono font-semibold ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            ${profit.toFixed(2)}
          </span>
        </p>
        <button
          onClick={submit}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          <Plus size={15} /> Add Bid
        </button>
      </div>
    </div>
  )
}
