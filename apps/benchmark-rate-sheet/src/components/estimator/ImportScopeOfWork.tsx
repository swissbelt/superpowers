import { useRef, useState } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { extractDocumentText } from '../../lib/documentText'
import {
  buildRiskNotes,
  buildScopeNotes,
  extractScopeOfWorkFields,
  type ApplicableFields,
  type ContextualFields,
  type ScopeOfWorkExtraction,
} from '../../lib/parseScopeOfWork'
import { BUILDING_TYPE_LABELS, FREQUENCY_LABELS } from '../../types'
import { FileUp, Loader2, X, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

type ApplicableKey = keyof ApplicableFields
type ContextualKey = keyof ContextualFields

const APPLICABLE_LABELS: Record<ApplicableKey, string> = {
  customerName: 'Customer Name',
  agency: 'Contracting Agency',
  contractNumber: 'Contract Number',
  contractType: 'Contract Type',
  facilityName: 'Building Name',
  address: 'Address',
  buildingType: 'Building Type',
  floors: 'Floors',
  squareFootage: 'Square Footage',
  frequency: 'Cleaning Frequency',
  termMonths: 'Contract Term (months)',
  startDate: 'Start Date',
  contactName: 'Contact Name',
  contactEmail: 'Contact Email',
  contactPhone: 'Contact Phone',
  requiredEmployees: 'Required Employees',
  suppliesProvider: 'Supplies Provided By',
  specialtyServices: 'Specialty Services Detected',
}

const CONTEXTUAL_LABELS: Record<ContextualKey, string> = {
  solicitationNumber: 'Solicitation Number',
  endDate: 'Period of Performance End',
  bidDueDate: 'Bid Due Date',
  numberOfBuildings: 'Number of Buildings',
  operatingHours: 'Operating Hours',
  occupancyType: 'Occupancy Type',
  scopeTasks: 'Scope Tasks Detected',
  supervisorRequired: 'Supervisor Required',
  minimumStaffing: 'Minimum Staffing',
  certifications: 'Certifications Required',
  backgroundChecksRequired: 'Background Checks Required',
  securityClearanceRequired: 'Security Clearance Required',
  insuranceRequired: 'Insurance Required',
  bondRequired: 'Bond Required',
  licensesRequired: 'Licenses Required',
}

function displayApplicableValue(key: ApplicableKey, value: unknown): string {
  if (key === 'buildingType') return BUILDING_TYPE_LABELS[value as keyof typeof BUILDING_TYPE_LABELS]
  if (key === 'frequency') return FREQUENCY_LABELS[value as keyof typeof FREQUENCY_LABELS]
  if (key === 'squareFootage') return `${(value as number).toLocaleString()} sq ft`
  if (key === 'suppliesProvider') return value === 'government' ? 'Government furnishes' : 'Contractor furnishes'
  if (key === 'specialtyServices') {
    return (value as { name: string; frequencyLabel: string }[])
      .map((s) => `${s.name} (${s.frequencyLabel})`)
      .join(', ')
  }
  return String(value)
}

function displayContextualValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

export function ImportScopeOfWork() {
  const { setCurrentInputs, saveScenario, setRiskNotes, setScopeNotes } = useAppState()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [progress, setProgress] = useState<{ page: number; totalPages: number } | null>(null)
  const [extraction, setExtraction] = useState<ScopeOfWorkExtraction | null>(null)
  const [selected, setSelected] = useState<Partial<Record<ApplicableKey, boolean>>>({})

  const applicableEntries = extraction
    ? (Object.entries(extraction.applicable) as [ApplicableKey, ApplicableFields[ApplicableKey]][]).filter(
        ([, field]) => field !== undefined,
      )
    : []
  const contextualEntries = extraction
    ? (Object.entries(extraction.contextual) as [ContextualKey, ContextualFields[ContextualKey]][]).filter(
        ([, field]) => field !== undefined,
      )
    : []

  const handleFile = async (file: File) => {
    setStatus('loading')
    setErrorMessage('')
    setProgress(null)
    try {
      const text = await extractDocumentText(file, (p) => setProgress(p))
      const fields = extractScopeOfWorkFields(text)
      const foundCount =
        Object.values(fields.applicable).filter(Boolean).length +
        Object.values(fields.contextual).filter(Boolean).length
      if (foundCount === 0) {
        setStatus('error')
        setErrorMessage(
          "Couldn't find any recognizable fields in this document. It may be a scanned image without selectable text, or use wording this tool doesn't recognize yet.",
        )
        return
      }
      setExtraction(fields)
      setSelected(
        Object.fromEntries(
          (Object.keys(fields.applicable) as ApplicableKey[])
            .filter((k) => fields.applicable[k])
            .map((k) => [k, true]),
        ),
      )
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to read this document.')
    }
  }

  const generateEstimate = () => {
    if (!extraction) return
    const { applicable } = extraction
    setCurrentInputs((prev) => {
      const next = {
        ...prev,
        customer: { ...prev.customer },
        contract: { ...prev.contract },
        building: { ...prev.building },
        specialtyServices: prev.specialtyServices.map((s) => ({ ...s })),
      }
      if (selected.customerName && applicable.customerName) next.customer.name = applicable.customerName.value
      if (selected.contactName && applicable.contactName) next.customer.contactName = applicable.contactName.value
      if (selected.contactEmail && applicable.contactEmail) next.customer.email = applicable.contactEmail.value
      if (selected.contactPhone && applicable.contactPhone) next.customer.phone = applicable.contactPhone.value
      if (selected.agency && applicable.agency) next.contract.agency = applicable.agency.value
      if (selected.contractNumber && applicable.contractNumber) next.contract.contractNumber = applicable.contractNumber.value
      if (selected.contractType && applicable.contractType) next.contract.contractType = applicable.contractType.value
      if (selected.termMonths && applicable.termMonths) next.contract.termMonths = applicable.termMonths.value
      if (selected.startDate && applicable.startDate) next.contract.startDate = applicable.startDate.value
      if (selected.facilityName && applicable.facilityName) next.building.name = applicable.facilityName.value
      if (selected.address && applicable.address) next.building.address = applicable.address.value
      if (selected.buildingType && applicable.buildingType) next.building.buildingType = applicable.buildingType.value
      if (selected.floors && applicable.floors) next.building.floors = applicable.floors.value
      if (selected.squareFootage && applicable.squareFootage) next.squareFootage = applicable.squareFootage.value
      if (selected.frequency && applicable.frequency) next.frequency = applicable.frequency.value
      if (selected.requiredEmployees && applicable.requiredEmployees)
        next.numberOfEmployees = applicable.requiredEmployees.value
      if (selected.suppliesProvider && applicable.suppliesProvider) {
        next.clientProvidesSupplies = applicable.suppliesProvider.value === 'government'
      }
      if (selected.specialtyServices && applicable.specialtyServices) {
        const detectedIds = new Set(applicable.specialtyServices.value.map((s) => s.id))
        next.specialtyServices = next.specialtyServices.map((s) =>
          detectedIds.has(s.id)
            ? {
                ...s,
                enabled: true,
                detectedFrequencyLabel: applicable.specialtyServices!.value.find((d) => d.id === s.id)
                  ?.frequencyLabel,
              }
            : s,
        )
      }
      return next
    })
    saveScenario(`AI Recommended — ${applicable.facilityName?.value ?? applicable.customerName?.value ?? 'Import'}`)
    setRiskNotes(buildRiskNotes(extraction))
    setScopeNotes(buildScopeNotes(extraction))
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
        {status === 'loading'
          ? progress
            ? `Reading page ${progress.page} of ${progress.totalPages}…`
            : 'Reading document…'
          : 'Upload Scope of Work'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
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
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl dark:bg-slate-800">
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
              Pulled from the document with text matching, not true document understanding.
              <span className="ml-1 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={12} /> green = clearly labeled
              </span>
              <span className="ml-2 inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={12} /> yellow = please confirm
              </span>
            </p>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Fields to Apply
                </h4>
                {applicableEntries.map(([key, field]) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                      field!.confidence === 'high'
                        ? 'border-emerald-100 dark:border-emerald-900/40'
                        : 'border-amber-100 dark:border-amber-900/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected[key] ?? false}
                      onChange={(e) => setSelected({ ...selected, [key]: e.target.checked })}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-slate-400 uppercase">
                        {field!.confidence === 'high' ? (
                          <CheckCircle2 size={12} className="text-emerald-500" />
                        ) : (
                          <AlertTriangle size={12} className="text-amber-500" />
                        )}
                        {APPLICABLE_LABELS[key]}
                      </p>
                      <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {displayApplicableValue(key, field!.value)}
                      </p>
                      <p className="truncate text-xs text-slate-400 dark:text-slate-500" title={field!.snippet}>
                        "{field!.snippet}"
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {contextualEntries.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Detected Requirements & Context (not auto-applied)
                  </h4>
                  <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-700">
                    <dl className="space-y-2">
                      {contextualEntries.map(([key, field]) => (
                        <div key={key} className="flex items-start justify-between gap-3 text-sm">
                          <dt className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            {field!.confidence === 'high' ? (
                              <CheckCircle2 size={12} className="text-emerald-500" />
                            ) : (
                              <AlertTriangle size={12} className="text-amber-500" />
                            )}
                            {CONTEXTUAL_LABELS[key]}
                          </dt>
                          <dd className="text-right font-medium text-slate-700 dark:text-slate-200">
                            {displayContextualValue(field!.value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-700">
              <button
                onClick={() => setExtraction(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={generateEstimate}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Generate Bid Estimate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
