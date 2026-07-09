export type BuildingType =
  | 'office'
  | 'medical'
  | 'government'
  | 'warehouse'
  | 'schools'
  | 'industrial'
  | 'deepCleaning'

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  office: 'Office',
  medical: 'Medical',
  government: 'Government',
  warehouse: 'Warehouse',
  schools: 'Schools',
  industrial: 'Industrial',
  deepCleaning: 'Deep Cleaning',
}

export type CleaningFrequency =
  | 'oneTime'
  | 'quarterly'
  | 'monthly'
  | 'biweekly'
  | '1x_week'
  | '2x_week'
  | '3x_week'
  | '5x_week'
  | '7x_week'

export const FREQUENCY_LABELS: Record<CleaningFrequency, string> = {
  oneTime: 'One-Time',
  quarterly: 'Quarterly',
  monthly: 'Monthly',
  biweekly: 'Every 2 Weeks',
  '1x_week': '1x / Week',
  '2x_week': '2x / Week',
  '3x_week': '3x / Week',
  '5x_week': '5x / Week (Weekdays)',
  '7x_week': '7x / Week (Daily)',
}

/** Average visits per month for each recurring frequency. */
export const FREQUENCY_VISITS_PER_MONTH: Record<CleaningFrequency, number> = {
  oneTime: 1,
  quarterly: 1 / 3,
  monthly: 1,
  biweekly: 2.167,
  '1x_week': 4.33,
  '2x_week': 8.66,
  '3x_week': 13,
  '5x_week': 21.67,
  '7x_week': 30.4,
}

export interface SpecialtyService {
  id: string
  name: string
  enabled: boolean
  costPerMonth: number
}

export interface CustomerInfo {
  name: string
  contactName: string
  email: string
  phone: string
}

export interface ContractInfo {
  agency: string
  contractNumber: string
  contractType: string
  startDate: string
  termMonths: number
}

export interface BuildingInfo {
  name: string
  address: string
  buildingType: BuildingType
  floors: number
}

export interface EstimateInputs {
  customer: CustomerInfo
  contract: ContractInfo
  building: BuildingInfo
  squareFootage: number
  frequency: CleaningFrequency
  laborRate: number
  useLibraryProductivity: boolean
  productivityOverride: number
  travelTimeMinutes: number
  mileagePerVisit: number
  clientProvidesSupplies: boolean
  suppliesCostPerSqFt: number
  specialtyServices: SpecialtyService[]
  insuranceAllocationPercent: number
  numberOfEmployees: number
  backgroundCheckCostPerEmployee: number
  evaFeePercent: number
  desiredProfitMarginPercent: number
  minimumPriceFloor: number
}

export interface Settings {
  laborBurdenPercent: number
  workersCompPercent: number
  payrollTaxPercent: number
  insuranceCostMonthly: number
  fuelCostPerGallon: number
  mileageReimbursementRate: number
  overheadPercent: number
  evaFeeCapDollar: number
  swamStatus: boolean
  defaultProfitMarginPercent: number
}

export type ProductivityLibrary = Record<BuildingType, number>

export interface EstimateResults {
  visitsPerMonth: number
  laborHoursPerVisit: number
  laborCostPerVisit: number
  travelCostPerVisit: number
  suppliesCostPerVisit: number
  specialtyCostPerVisit: number
  insuranceAllocationPerVisit: number
  backgroundCheckCostPerVisit: number
  overheadPerVisit: number
  evaFeePerVisit: number
  totalOperatingCostPerVisit: number
  recommendedPricePerVisit: number
  priceFloorApplied: boolean
  profitPerVisit: number
  grossMarginPercent: number
  monthlyRevenue: number
  annualRevenue: number
  monthlyCost: number
  annualCost: number
  monthlyProfit: number
  annualProfit: number
  costPerSquareFoot: number
  pricePerSquareFoot: number
}

export interface Scenario {
  id: string
  label: string
  createdAt: string
  inputs: EstimateInputs
  results: EstimateResults
}

export type BidStatus = 'Won' | 'Lost' | 'Pending'

export interface Bid {
  id: string
  customer: string
  agency: string
  date: string
  squareFootage: number
  frequency: CleaningFrequency
  finalPrice: number
  cost: number
  profit: number
  status: BidStatus
  notes: string
}

export interface AppData {
  settings: Settings
  productivity: ProductivityLibrary
  currentInputs: EstimateInputs
  scenarios: Scenario[]
  bids: Bid[]
  theme: 'light' | 'dark'
}
