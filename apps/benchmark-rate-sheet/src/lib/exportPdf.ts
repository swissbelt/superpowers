import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { EstimateInputs, EstimateResults, Settings } from '../types'
import { BUILDING_TYPE_LABELS, FREQUENCY_LABELS } from '../types'
import { formatCurrency, formatPercent } from './format'

const COMPANY_NAME = 'Benchmark Contract Services'
const ACCENT: [number, number, number] = [67, 56, 202]

function drawHeader(doc: jsPDF, title: string) {
  doc.setFillColor(...ACCENT)
  doc.rect(0, 0, 210, 26, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(COMPANY_NAME, 14, 12)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 14, 19)
  doc.setTextColor(20, 20, 20)
  return 34
}

function drawFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(140, 140, 140)
    doc.text(
      `Generated ${new Date().toLocaleDateString()} · Page ${i} of ${pageCount}`,
      14,
      290,
    )
  }
}

export function generateQuotePdf(inputs: EstimateInputs, results: EstimateResults) {
  const doc = new jsPDF()
  let y = drawHeader(doc, 'Cleaning Services Quote')

  doc.setFontSize(10)
  doc.setTextColor(20, 20, 20)
  doc.setFont('helvetica', 'bold')
  doc.text('Prepared For', 14, y)
  doc.setFont('helvetica', 'normal')
  doc.text(inputs.customer.name || 'Prospective Customer', 14, y + 5)
  doc.text(inputs.contract.agency || '', 14, y + 10)
  doc.text(inputs.building.name || '', 14, y + 15)
  doc.text(inputs.building.address || '', 14, y + 20)

  doc.setFont('helvetica', 'bold')
  doc.text('Quote Details', 120, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 120, y + 5)
  doc.text(`Contract Type: ${inputs.contract.contractType}`, 120, y + 10)
  doc.text(`Term: ${inputs.contract.termMonths} months`, 120, y + 15)

  y += 30

  autoTable(doc, {
    startY: y,
    head: [['Service Detail', 'Value']],
    body: [
      ['Building Type', BUILDING_TYPE_LABELS[inputs.building.buildingType]],
      ['Square Footage', inputs.squareFootage.toLocaleString()],
      ['Cleaning Frequency', FREQUENCY_LABELS[inputs.frequency]],
      ['Supplies Included', inputs.clientProvidesSupplies ? 'Provided by Client' : 'Provided by Contractor'],
    ],
    theme: 'striped',
    headStyles: { fillColor: ACCENT },
    styles: { fontSize: 10 },
  })

  const afterDetails = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8

  autoTable(doc, {
    startY: afterDetails,
    head: [['Pricing Summary', 'Amount']],
    body: [
      ['Price Per Visit', formatCurrency(results.recommendedPricePerVisit)],
      ['Visits Per Month', results.visitsPerMonth.toFixed(2)],
      ['Monthly Total', formatCurrency(results.monthlyRevenue)],
      ['Annual Total', formatCurrency(results.annualRevenue)],
    ],
    theme: 'grid',
    headStyles: { fillColor: ACCENT },
    styles: { fontSize: 11, fontStyle: 'bold' },
  })

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(90, 90, 90)
  doc.text(
    'This quote is valid for 30 days from the date above. Pricing subject to final walkthrough and scope confirmation.',
    14,
    finalY,
    { maxWidth: 180 },
  )

  drawFooter(doc)
  doc.save('benchmark-quote.pdf')
}

export function generateInternalCostBreakdownPdf(
  inputs: EstimateInputs,
  results: EstimateResults,
  settings: Settings,
) {
  const doc = new jsPDF()
  let y = drawHeader(doc, 'Internal Cost Breakdown (Confidential)')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Customer: ${inputs.customer.name || 'N/A'}   Building: ${inputs.building.name || 'N/A'}`, 14, y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [['Cost Component', 'Per Visit', 'Monthly', 'Annual']],
    body: [
      ['Labor', formatCurrency(results.laborCostPerVisit), formatCurrency(results.laborCostPerVisit * results.visitsPerMonth), formatCurrency(results.laborCostPerVisit * results.visitsPerMonth * 12)],
      ['Travel', formatCurrency(results.travelCostPerVisit), formatCurrency(results.travelCostPerVisit * results.visitsPerMonth), formatCurrency(results.travelCostPerVisit * results.visitsPerMonth * 12)],
      ['Supplies', formatCurrency(results.suppliesCostPerVisit), formatCurrency(results.suppliesCostPerVisit * results.visitsPerMonth), formatCurrency(results.suppliesCostPerVisit * results.visitsPerMonth * 12)],
      ['Specialty Services', formatCurrency(results.specialtyCostPerVisit), formatCurrency(results.specialtyCostPerVisit * results.visitsPerMonth), formatCurrency(results.specialtyCostPerVisit * results.visitsPerMonth * 12)],
      ['Insurance', formatCurrency(results.insuranceAllocationPerVisit), formatCurrency(results.insuranceAllocationPerVisit * results.visitsPerMonth), formatCurrency(results.insuranceAllocationPerVisit * results.visitsPerMonth * 12)],
      ['Background Checks', formatCurrency(results.backgroundCheckCostPerVisit), formatCurrency(results.backgroundCheckCostPerVisit * results.visitsPerMonth), formatCurrency(results.backgroundCheckCostPerVisit * results.visitsPerMonth * 12)],
      ['Overhead', formatCurrency(results.overheadPerVisit), formatCurrency(results.overheadPerVisit * results.visitsPerMonth), formatCurrency(results.overheadPerVisit * results.visitsPerMonth * 12)],
      ['eVA Fee', formatCurrency(results.evaFeePerVisit), formatCurrency(results.evaFeePerVisit * results.visitsPerMonth), formatCurrency(results.evaFeePerVisit * results.visitsPerMonth * 12)],
      ['Total Operating Cost', formatCurrency(results.totalOperatingCostPerVisit), formatCurrency(results.monthlyCost), formatCurrency(results.annualCost)],
      ['Selling Price', formatCurrency(results.recommendedPricePerVisit), formatCurrency(results.monthlyRevenue), formatCurrency(results.annualRevenue)],
      ['Profit', formatCurrency(results.profitPerVisit), formatCurrency(results.monthlyProfit), formatCurrency(results.annualProfit)],
    ],
    theme: 'grid',
    headStyles: { fillColor: ACCENT },
    styles: { fontSize: 9 },
  })

  const afterCosts = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8

  autoTable(doc, {
    startY: afterCosts,
    head: [['Rate Assumptions', 'Value']],
    body: [
      ['Labor Burden %', formatPercent(settings.laborBurdenPercent)],
      ["Workers' Comp %", formatPercent(settings.workersCompPercent)],
      ['Payroll Tax %', formatPercent(settings.payrollTaxPercent)],
      ['Overhead %', formatPercent(settings.overheadPercent)],
      ['Gross Margin %', formatPercent(results.grossMarginPercent)],
      ['Mileage Reimbursement', formatCurrency(settings.mileageReimbursementRate)],
      ['eVA Fee Cap', formatCurrency(settings.evaFeeCapDollar)],
      ['SWaM Certified', settings.swamStatus ? 'Yes' : 'No'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [71, 85, 105] },
    styles: { fontSize: 9 },
  })

  drawFooter(doc)
  doc.save('benchmark-internal-cost-breakdown.pdf')
}

export function generateProposalSummaryPdf(inputs: EstimateInputs, results: EstimateResults) {
  const doc = new jsPDF()
  let y = drawHeader(doc, 'Proposal Summary')

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(inputs.building.name || 'Proposed Cleaning Services', 14, y + 4)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`${inputs.customer.name || ''}  ·  ${inputs.contract.agency || ''}`, 14, y + 11)
  y += 20

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Detail']],
    body: [
      ['Scope', `${inputs.squareFootage.toLocaleString()} sq ft · ${BUILDING_TYPE_LABELS[inputs.building.buildingType]}`],
      ['Frequency', FREQUENCY_LABELS[inputs.frequency]],
      ['Contract Term', `${inputs.contract.termMonths} months`],
      ['Price Per Visit', formatCurrency(results.recommendedPricePerVisit)],
      ['Monthly Investment', formatCurrency(results.monthlyRevenue)],
      ['Annual Investment', formatCurrency(results.annualRevenue)],
    ],
    theme: 'plain',
    headStyles: { fillColor: ACCENT },
    styles: { fontSize: 11 },
  })

  const afterTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20
  doc.setFontSize(10)
  doc.text('Authorized Signature: ________________________________', 14, afterTable)
  doc.text('Date: ____________________', 14, afterTable + 10)

  drawFooter(doc)
  doc.save('benchmark-proposal-summary.pdf')
}
