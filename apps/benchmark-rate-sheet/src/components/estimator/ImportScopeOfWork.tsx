import { useRef, useState } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { extractPdfText } from '../../lib/pdfText'
import { extractScopeOfWorkFields, type ScopeOfWorkExtraction } from '../../lib/parseScopeOfWork'
import { BUILDING_TYPE_LABELS, FREQUENCY_LABELS } from '../../types'
import { FileUp, Loader2, X, AlertCircle } from 'lucide-react'

type FieldKey = keyof ScopeOfWorkExtraction

const FIELD_LABELS: Record<FieldKey, string> = {
  customerName: 'Customer Name',
  agency: 'Contracting Agency',
  contractNumber: 'Contract Number',
  contractType: 'Contract Type',
  buildingName: 'Building Name',
  address: 'Address',
  buildingType: 'Building Type',
  floors: 'Floors',
  squareFootage: 'Square Footage',
  frequency: 'Cleaning Frequency',
  termMonths: 'Contract Term (months)',
  startDate: 'Start Date',
}

function displayValue(key: FieldKey, value: unknown): string {
  if (key === 'buildingType') return BUILDING_TYPE_LABELS[value as keyof typeof BUILDING_TYPE_LABELS]
  if (key === 'frequency') return FREQUENCY_LABELS[value as keyof typeof FREQUENCY_LABELS]
  if (key === 'squareFootage') return `${(value as number).toLocaleString()} sq ft`
  return String(value)
}

export function ImportScopeOfWork() {
  const { setCurrentInputs } = useAppState()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [extraction, setExtraction] = useState<ScopeOfWorkExtraction | null>(null)
  const [selected, setSelected] = useState<Partial<Record<FieldKey, boolean>>>({})

  const fieldEntries = extraction
    ? (Object.entries(extraction) as [FieldKey, ScopeOfWorkExtraction[FieldKey]][]).filter(
        ([, field]) => field !== undefined,
      )
    : []

  const handleFile = async (file: File) => {
    setStatus('loading')
    setErrorMessage('')
    try {
      const text = await extractPdfText(file)
      const fields = extractScopeOfWorkFields(text)
      const found = Object.values(fields).filter(Boolean)
      if (found.length === 0) {
        setStatus('error')
        setErrorMessage(
          "Couldn't find any recognizable fields in this PDF. It may be a scanned image without selectable text, or use wording this tool doesn't recognize yet.",
        )
        return
      }
      setExtraction(fields)
      setSelected(
        Object.fromEntries(
          (Object.keys(fields) as FieldKey[])
            .filter((k) => fields[k])
            .map((k) => [k, true]),
        ),
      )
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to read this PDF.')
    }
  }

  const applySelected = () => {
    if (!extraction) return
    setCurrentInputs((prev) => {
      const next = {
        ...prev,
        customer: { ...prev.customer },
        contract: { ...prev.contract },
        building: { ...prev.building },
      }
      if (selected.customerName && extraction.customerName) {
        next.customer.name = extraction.customerName.value
      }
      if (selected.agency && extraction.agency) {
        next.contract.agency = extraction.agency.value
      }
      if (selected.contractNumber && extraction.contractNumber) {
        next.contract.contractNumber = extraction.contractNumber.value
      }
      if (selected.contractType && extraction.contractType) {
        next.contract.contractType = extraction.contractType.value
      }
      if (selected.termMonths && extraction.termMonths) {
        next.contract.termMonths = extraction.termMonths.value
      }
      if (selected.startDate && extraction.startDate) {
        next.contract.startDate = extraction.startDate.value
      }
      if (selected.buildingName && extraction.buildingName) {
        next.building.name = extraction.buildingName.value
      }
      if (selected.address && extraction.address) {
        next.building.address = extraction.address.value
      }
      if (selected.buildingType && extraction.buildingType) {
        next.building.buildingType = extraction.buildingType.value
      }
      if (selected.floors && extraction.floors) {
        next.building.floors = extraction.floors.value
      }
      if (selected.squareFootage && extraction.squareFootage) {
        next.squareFootage = extraction.squareFootage.value
      }
      if (selected.frequency && extraction.frequency) {
        next.frequency = extraction.frequency.value
      }
      return next
    })
    setExtraction(null)
  }

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={status === 'loading'}
        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        {status === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} />}
        Import Scope of Work
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {status === 'error' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-slate-800">
            <div className="mb-3 flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertCircle size={18} />
              <h3 className="font-semibold">Import Failed</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{errorMessage}</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {extraction && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                Review Detected Fields
              </h3>
              <button
                onClick={() => setExtraction(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <p className="border-b border-slate-100 px-5 py-3 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
              Pulled from the PDF with text matching, not verified. Uncheck anything wrong or
              irrelevant before applying.
            </p>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {fieldEntries.map(([key, field]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selected[key] ?? false}
                    onChange={(e) => setSelected({ ...selected, [key]: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                      {FIELD_LABELS[key]}
                    </p>
                    <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {displayValue(key, field!.value)}
                    </p>
                    <p className="truncate text-xs text-slate-400 dark:text-slate-500" title={field!.snippet}>
                      "{field!.snippet}"
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-700">
              <button
                onClick={() => setExtraction(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={applySelected}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Apply to Estimate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
