import {
  FREQUENCY_VISITS_PER_MONTH,
  type EstimateInputs,
  type EstimateResults,
  type ProductivityLibrary,
  type Settings,
} from '../types'

export function effectiveProductivity(
  inputs: EstimateInputs,
  productivity: ProductivityLibrary,
): number {
  if (inputs.useLibraryProductivity) {
    return productivity[inputs.building.buildingType]
  }
  return inputs.productivityOverride
}

export function calculateEstimate(
  inputs: EstimateInputs,
  settings: Settings,
  productivity: ProductivityLibrary,
): EstimateResults {
  const visitsPerMonth = FREQUENCY_VISITS_PER_MONTH[inputs.frequency]

  const sqFtPerHour = Math.max(1, effectiveProductivity(inputs, productivity))
  const laborHoursPerVisit = inputs.squareFootage / sqFtPerHour

  const burdenMultiplier =
    1 +
    settings.laborBurdenPercent / 100 +
    settings.workersCompPercent / 100 +
    settings.payrollTaxPercent / 100
  const laborCostPerVisit =
    laborHoursPerVisit * inputs.laborRate * burdenMultiplier

  const travelTimeCost = (inputs.travelTimeMinutes / 60) * inputs.laborRate
  const mileageCost =
    inputs.mileagePerVisit * settings.mileageReimbursementRate
  const travelCostPerVisit = travelTimeCost + mileageCost

  const suppliesCostPerVisit = inputs.clientProvidesSupplies
    ? 0
    : inputs.suppliesCostPerSqFt * inputs.squareFootage

  const specialtyMonthlyTotal = inputs.specialtyServices
    .filter((s) => s.enabled)
    .reduce((sum, s) => sum + s.costPerMonth, 0)
  const specialtyCostPerVisit =
    visitsPerMonth > 0 ? specialtyMonthlyTotal / visitsPerMonth : 0

  const insuranceAllocationPerVisit =
    visitsPerMonth > 0
      ? (settings.insuranceCostMonthly * (inputs.insuranceAllocationPercent / 100)) /
        visitsPerMonth
      : 0

  const backgroundCheckMonthly =
    (inputs.numberOfEmployees * inputs.backgroundCheckCostPerEmployee) / 12
  const backgroundCheckCostPerVisit =
    visitsPerMonth > 0 ? backgroundCheckMonthly / visitsPerMonth : 0

  const directCosts =
    laborCostPerVisit +
    travelCostPerVisit +
    suppliesCostPerVisit +
    specialtyCostPerVisit +
    insuranceAllocationPerVisit +
    backgroundCheckCostPerVisit

  const overheadPerVisit = directCosts * (settings.overheadPercent / 100)

  const totalOperatingCostBeforeEva = directCosts + overheadPerVisit

  const marginDivisor = 1 - inputs.desiredProfitMarginPercent / 100
  const priceBeforeEva =
    marginDivisor > 0
      ? totalOperatingCostBeforeEva / marginDivisor
      : totalOperatingCostBeforeEva

  const evaFeeUncapped = priceBeforeEva * (inputs.evaFeePercent / 100)
  const evaFeeCapPerVisit =
    visitsPerMonth > 0 ? settings.evaFeeCapDollar / visitsPerMonth : settings.evaFeeCapDollar
  const evaFeePerVisit = Math.min(evaFeeUncapped, evaFeeCapPerVisit)

  const totalOperatingCostPerVisit = totalOperatingCostBeforeEva + evaFeePerVisit

  let recommendedPricePerVisit = priceBeforeEva + evaFeePerVisit
  let priceFloorApplied = false
  if (recommendedPricePerVisit < inputs.minimumPriceFloor) {
    recommendedPricePerVisit = inputs.minimumPriceFloor
    priceFloorApplied = true
  }

  const profitPerVisit = recommendedPricePerVisit - totalOperatingCostPerVisit
  const grossMarginPercent =
    recommendedPricePerVisit > 0
      ? (profitPerVisit / recommendedPricePerVisit) * 100
      : 0

  const monthlyRevenue = recommendedPricePerVisit * visitsPerMonth
  const monthlyCost = totalOperatingCostPerVisit * visitsPerMonth
  const monthlyProfit = profitPerVisit * visitsPerMonth
  const annualRevenue = monthlyRevenue * 12
  const annualCost = monthlyCost * 12
  const annualProfit = monthlyProfit * 12

  const costPerSquareFoot =
    inputs.squareFootage > 0
      ? totalOperatingCostPerVisit / inputs.squareFootage
      : 0
  const pricePerSquareFoot =
    inputs.squareFootage > 0
      ? recommendedPricePerVisit / inputs.squareFootage
      : 0

  return {
    visitsPerMonth,
    laborHoursPerVisit,
    laborCostPerVisit,
    travelCostPerVisit,
    suppliesCostPerVisit,
    specialtyCostPerVisit,
    insuranceAllocationPerVisit,
    backgroundCheckCostPerVisit,
    overheadPerVisit,
    evaFeePerVisit,
    totalOperatingCostPerVisit,
    recommendedPricePerVisit,
    priceFloorApplied,
    profitPerVisit,
    grossMarginPercent,
    monthlyRevenue,
    annualRevenue,
    monthlyCost,
    annualCost,
    monthlyProfit,
    annualProfit,
    costPerSquareFoot,
    pricePerSquareFoot,
  }
}
