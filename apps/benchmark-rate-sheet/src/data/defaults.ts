import type {
  EstimateInputs,
  ProductivityLibrary,
  Settings,
  SpecialtyService,
} from '../types'

export const DEFAULT_PRODUCTIVITY: ProductivityLibrary = {
  office: 3000,
  medical: 2200,
  government: 2600,
  warehouse: 4500,
  schools: 2800,
  industrial: 4000,
  deepCleaning: 1200,
}

export const DEFAULT_SETTINGS: Settings = {
  laborBurdenPercent: 12,
  workersCompPercent: 4,
  payrollTaxPercent: 7.65,
  insuranceCostMonthly: 350,
  fuelCostPerGallon: 3.25,
  mileageReimbursementRate: 0.67,
  overheadPercent: 10,
  evaFeeCapDollar: 500,
  swamStatus: true,
  defaultProfitMarginPercent: 20,
}

export function defaultSpecialtyServices(): SpecialtyService[] {
  return [
    { id: 'floor-strip-wax', name: 'Floor Stripping & Waxing', enabled: false, costPerMonth: 0 },
    { id: 'carpet-extraction', name: 'Carpet Extraction', enabled: false, costPerMonth: 0 },
    { id: 'window-interior', name: 'Interior Window Cleaning', enabled: false, costPerMonth: 0 },
    { id: 'pressure-washing', name: 'Pressure Washing', enabled: false, costPerMonth: 0 },
    { id: 'disinfection', name: 'Disinfection / Fogging', enabled: false, costPerMonth: 0 },
    { id: 'post-construction', name: 'Post-Construction Cleanup', enabled: false, costPerMonth: 0 },
  ]
}

export function defaultEstimateInputs(): EstimateInputs {
  return {
    customer: { name: '', contactName: '', email: '', phone: '' },
    contract: {
      agency: '',
      contractNumber: '',
      contractType: 'SWaM Set-Aside',
      startDate: new Date().toISOString().slice(0, 10),
      termMonths: 12,
    },
    building: { name: '', address: '', buildingType: 'office', floors: 1 },
    squareFootage: 10000,
    frequency: '5x_week',
    laborRate: 15,
    useLibraryProductivity: true,
    productivityOverride: DEFAULT_PRODUCTIVITY.office,
    travelTimeMinutes: 15,
    mileagePerVisit: 8,
    clientProvidesSupplies: false,
    suppliesCostPerSqFt: 0.015,
    specialtyServices: defaultSpecialtyServices(),
    insuranceAllocationPercent: 100,
    numberOfEmployees: 2,
    backgroundCheckCostPerEmployee: 45,
    evaFeePercent: 1,
    desiredProfitMarginPercent: DEFAULT_SETTINGS.defaultProfitMarginPercent,
    minimumPriceFloor: 200,
  }
}

export const CONTRACT_TYPES = [
  'SWaM Set-Aside',
  'Open Market',
  'GSA Schedule',
  'State Term Contract',
  'Sole Source',
  'IFB / RFP',
]
