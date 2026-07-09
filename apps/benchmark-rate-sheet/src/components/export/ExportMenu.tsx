import { useEffect, useRef, useState } from 'react'
import { useAppState } from '../../context/AppStateContext'
import { exportEstimateWorkbook } from '../../lib/exportExcel'
import {
  generateInternalCostBreakdownPdf,
  generateProposalSummaryPdf,
  generateQuotePdf,
} from '../../lib/exportPdf'
import { Download, FileSpreadsheet, FileText, ClipboardList, ChevronDown } from 'lucide-react'

export function ExportMenu() {
  const { data, results } = useAppState()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const items = [
    {
      label: 'Excel Workbook',
      icon: <FileSpreadsheet size={15} />,
      action: () => exportEstimateWorkbook(data.currentInputs, results),
    },
    {
      label: 'Professional PDF Quote',
      icon: <FileText size={15} />,
      action: () => generateQuotePdf(data.currentInputs, results),
    },
    {
      label: 'Internal Cost Breakdown',
      icon: <ClipboardList size={15} />,
      action: () => generateInternalCostBreakdownPdf(data.currentInputs, results, data.settings),
    },
    {
      label: 'Printable Proposal Summary',
      icon: <FileText size={15} />,
      action: () => generateProposalSummaryPdf(data.currentInputs, results),
    },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        <Download size={15} /> Export
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="animate-fade-in absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.action()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
