import * as XLSX from 'xlsx'
import type { AppData, EstimateInputs, EstimateResults } from '../types'
import { BUILDING_TYPE_LABELS, FREQUENCY_LABELS } from '../types'

function estimateSummaryRows(inputs: EstimateInputs, results: EstimateResults) {
  return [
    { Field: 'Customer', Value: inputs.customer.name },
    { Field: 'Agency', Value: inputs.contract.agency },
    { Field: 'Building', Value: inputs.building.name },
    { Field: 'Building Type', Value: BUILDING_TYPE_LABELS[inputs.building.buildingType] },
    { Field: 'Square Footage', Value: inputs.squareFootage },
    { Field: 'Frequency', Value: FREQUENCY_LABELS[inputs.frequency] },
    { Field: 'Visits / Month', Value: Number(results.visitsPerMonth.toFixed(2)) },
    { Field: 'Labor Hours / Visit', Value: Number(results.laborHoursPerVisit.toFixed(2)) },
    { Field: 'Labor Cost / Visit', Value: Number(results.laborCostPerVisit.toFixed(2)) },
    { Field: 'Travel Cost / Visit', Value: Number(results.travelCostPerVisit.toFixed(2)) },
    { Field: 'Supplies Cost / Visit', Value: Number(results.suppliesCostPerVisit.toFixed(2)) },
    { Field: 'Specialty Services / Visit', Value: Number(results.specialtyCostPerVisit.toFixed(2)) },
    { Field: 'Insurance Allocation / Visit', Value: Number(results.insuranceAllocationPerVisit.toFixed(2)) },
    { Field: 'Background Checks / Visit', Value: Number(results.backgroundCheckCostPerVisit.toFixed(2)) },
    { Field: 'Overhead / Visit', Value: Number(results.overheadPerVisit.toFixed(2)) },
    { Field: 'eVA Fee / Visit', Value: Number(results.evaFeePerVisit.toFixed(2)) },
    { Field: 'Total Operating Cost / Visit', Value: Number(results.totalOperatingCostPerVisit.toFixed(2)) },
    { Field: 'Recommended Price / Visit', Value: Number(results.recommendedPricePerVisit.toFixed(2)) },
    { Field: 'Profit / Visit', Value: Number(results.profitPerVisit.toFixed(2)) },
    { Field: 'Gross Margin %', Value: Number(results.grossMarginPercent.toFixed(2)) },
    { Field: 'Monthly Revenue', Value: Number(results.monthlyRevenue.toFixed(2)) },
    { Field: 'Annual Revenue', Value: Number(results.annualRevenue.toFixed(2)) },
    { Field: 'Cost / Sq Ft', Value: Number(results.costPerSquareFoot.toFixed(4)) },
    { Field: 'Price / Sq Ft', Value: Number(results.pricePerSquareFoot.toFixed(4)) },
  ]
}

export function exportEstimateWorkbook(
  inputs: EstimateInputs,
  results: EstimateResults,
  fileName = 'benchmark-estimate.xlsx',
) {
  const wb = XLSX.utils.book_new()
  const summarySheet = XLSX.utils.json_to_sheet(estimateSummaryRows(inputs, results))
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Estimate Summary')
  XLSX.writeFile(wb, fileName)
}

export function exportScenarioWorkbook(data: AppData, fileName = 'benchmark-scenarios.xlsx') {
  const wb = XLSX.utils.book_new()

  const rows = data.scenarios.map((s) => ({
    Scenario: s.label,
    Customer: s.inputs.customer.name,
    'Square Footage': s.inputs.squareFootage,
    Frequency: FREQUENCY_LABELS[s.inputs.frequency],
    'Price / Visit': Number(s.results.recommendedPricePerVisit.toFixed(2)),
    'Cost / Visit': Number(s.results.totalOperatingCostPerVisit.toFixed(2)),
    'Profit / Visit': Number(s.results.profitPerVisit.toFixed(2)),
    'Margin %': Number(s.results.grossMarginPercent.toFixed(2)),
    'Monthly Revenue': Number(s.results.monthlyRevenue.toFixed(2)),
    'Annual Revenue': Number(s.results.annualRevenue.toFixed(2)),
  }))

  const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Scenario: 'No scenarios saved yet' }])
  XLSX.utils.book_append_sheet(wb, sheet, 'Scenarios')
  XLSX.writeFile(wb, fileName)
}

export function exportBidHistoryWorkbook(data: AppData, fileName = 'benchmark-bid-history.xlsx') {
  const wb = XLSX.utils.book_new()

  const rows = data.bids.map((b) => ({
    Customer: b.customer,
    Agency: b.agency,
    Date: b.date,
    'Square Footage': b.squareFootage,
    'Building Type': b.buildingType ? BUILDING_TYPE_LABELS[b.buildingType] : '',
    Frequency: FREQUENCY_LABELS[b.frequency],
    'Final Price': b.finalPrice,
    Cost: b.cost,
    Profit: b.profit,
    Status: b.status,
    Notes: b.notes,
  }))

  const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Customer: 'No bids recorded yet' }])
  XLSX.utils.book_append_sheet(wb, sheet, 'Bid History')
  XLSX.writeFile(wb, fileName)
}
