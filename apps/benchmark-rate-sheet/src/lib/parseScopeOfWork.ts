import { CONTRACT_TYPES } from '../data/defaults'
import type { BuildingType, CleaningFrequency } from '../types'

export type Confidence = 'high' | 'needs-confirmation'

export interface ExtractedField<T> {
  value: T
  /** The line (or nearby text) the value was pulled from, shown to the user for verification. */
  snippet: string
  confidence: Confidence
}

export interface DetectedSpecialtyService {
  id: string
  name: string
  frequencyLabel: string
}

/** Fields that map directly onto an EstimateInputs field when applied. */
export interface ApplicableFields {
  customerName?: ExtractedField<string>
  agency?: ExtractedField<string>
  contractNumber?: ExtractedField<string>
  contractType?: ExtractedField<string>
  facilityName?: ExtractedField<string>
  address?: ExtractedField<string>
  buildingType?: ExtractedField<BuildingType>
  floors?: ExtractedField<number>
  squareFootage?: ExtractedField<number>
  frequency?: ExtractedField<CleaningFrequency>
  termMonths?: ExtractedField<number>
  startDate?: ExtractedField<string>
  contactName?: ExtractedField<string>
  contactEmail?: ExtractedField<string>
  contactPhone?: ExtractedField<string>
  requiredEmployees?: ExtractedField<number>
  suppliesProvider?: ExtractedField<'government' | 'contractor'>
  specialtyServices?: ExtractedField<DetectedSpecialtyService[]>
}

/** Fields shown for context/risk awareness only — never silently applied to pricing. */
export interface ContextualFields {
  solicitationNumber?: ExtractedField<string>
  endDate?: ExtractedField<string>
  bidDueDate?: ExtractedField<string>
  numberOfBuildings?: ExtractedField<number>
  operatingHours?: ExtractedField<string>
  occupancyType?: ExtractedField<string>
  scopeTasks?: ExtractedField<string[]>
  supervisorRequired?: ExtractedField<boolean>
  minimumStaffing?: ExtractedField<string>
  certifications?: ExtractedField<string[]>
  backgroundChecksRequired?: ExtractedField<boolean>
  securityClearanceRequired?: ExtractedField<boolean>
  insuranceRequired?: ExtractedField<boolean>
  bondRequired?: ExtractedField<boolean>
  licensesRequired?: ExtractedField<string[]>
}

export interface ScopeOfWorkExtraction {
  applicable: ApplicableFields
  contextual: ContextualFields
}

function cleanLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

/** Finds the first line matching one of the given label patterns and returns the trailing value. */
function findLabeledValue(
  lines: string[],
  labels: string[],
  maxLength = 80,
): ExtractedField<string> | undefined {
  const labelAlternation = labels.join('|')
  const sameLineRe = new RegExp(`^(?:${labelAlternation})\\s*[:\\-]\\s*(.+)$`, 'i')
  const labelOnlyRe = new RegExp(`^(?:${labelAlternation})\\s*[:\\-]?\\s*$`, 'i')

  for (let i = 0; i < lines.length; i++) {
    const sameLine = lines[i].match(sameLineRe)
    if (sameLine && sameLine[1].trim()) {
      const value = sameLine[1].trim().slice(0, maxLength)
      return { value, snippet: lines[i], confidence: 'high' }
    }
    if (labelOnlyRe.test(lines[i]) && lines[i + 1]) {
      const value = lines[i + 1].trim().slice(0, maxLength)
      if (value) return { value, snippet: `${lines[i]} ${lines[i + 1]}`, confidence: 'high' }
    }
  }
  return undefined
}

const BUILDING_TYPE_KEYWORDS: [BuildingType, RegExp][] = [
  ['medical', /\b(medical|hospital|clinic|healthcare|health care|dental|dialysis)\b/i],
  ['government', /\b(government|federal|municipal|county|city hall|department of|dept\.? of|courthouse)\b/i],
  ['warehouse', /\b(warehouse|distribution center|logistics center|fulfillment center)\b/i],
  ['schools', /\b(school|university|college|campus|classroom|academy)\b/i],
  ['industrial', /\b(industrial|factory|manufacturing plant|production facility)\b/i],
  ['deepCleaning', /\b(deep clean|deep-clean|post-construction|construction cleanup)\b/i],
  ['office', /\b(office|administrative building|corporate headquarters)\b/i],
]

const FREQUENCY_KEYWORDS: [CleaningFrequency, RegExp][] = [
  ['7x_week', /\b(7 days? a week|seven days? a week|daily including weekends|365 days)\b/i],
  ['5x_week', /\b(5 days? a week|five days? a week|monday\s*(through|-|to)\s*friday|weekdays only|weekday service)\b/i],
  ['3x_week', /\b(3 (days?|times?) (a|per) week|three (days?|times?) (a|per) week)\b/i],
  ['2x_week', /\b(2 (days?|times?) (a|per) week|twice (a|per) week|two (days?|times?) (a|per) week)\b/i],
  ['biweekly', /\b(bi-?weekly|every (other|two) weeks?)\b/i],
  ['quarterly', /\b(quarterly|every (three|3) months)\b/i],
  ['monthly', /\b(monthly|once a month)\b/i],
  ['1x_week', /\b(once a week|1x per week|weekly service|daily)\b/i],
]

const SCOPE_TASK_KEYWORDS: [string, RegExp][] = [
  ['Vacuuming', /\bvacuum(ing)?\b/i],
  ['Mopping', /\bmopp?ing\b/i],
  ['Restroom Cleaning', /\brestroom|lavatory|bathroom cleaning\b/i],
  ['Trash Removal', /\btrash removal|refuse removal|waste removal|emptying trash\b/i],
  ['Dusting', /\bdusting\b/i],
  ['Sanitization', /\bsanitiz(e|ing|ation)|disinfect(ing|ion)?\b/i],
]

// Specialty services detected separately from routine recurring janitorial scope,
// matched to the same ids used by data/defaults.ts#defaultSpecialtyServices.
const SPECIALTY_SERVICE_KEYWORDS: [string, string, RegExp][] = [
  ['window-interior', 'Interior Window Cleaning', /\binterior windows?\b.{0,40}?\bclean/i],
  ['pressure-washing', 'Pressure Washing', /\b(pressure|power) wash(ing)?\b/i],
  ['carpet-extraction', 'Carpet Extraction', /\bcarpet (cleaning|extraction|shampoo)\b/i],
  ['floor-strip-wax', 'Floor Stripping & Waxing', /\b(strip(ping)? and wax(ing)?|floor (stripping|waxing|refinishing))\b/i],
  ['post-construction', 'Post-Construction Cleanup', /\bpost-construction cleanup\b/i],
]

const SERVICE_FREQUENCY_KEYWORDS: [string, RegExp][] = [
  ['Weekly', /\bweekly\b/i],
  ['Monthly', /\bmonthly\b/i],
  ['Quarterly', /\bquarterly\b/i],
  ['Semiannual', /\b(semiannual|semi-annual|twice (a|per) year|twice yearly)\b/i],
  ['Annual', /\b(annual(ly)?|once a year|yearly)\b/i],
]

function findContractType(text: string): ExtractedField<string> | undefined {
  for (const type of CONTRACT_TYPES) {
    const keyword = type.split(' ')[0]
    const re = new RegExp(`\\b${keyword}\\b`, 'i')
    const match = text.match(re)
    if (match) return { value: type, snippet: match[0], confidence: 'high' }
  }
  const swamMatch = text.match(/\bSWaM\b/i)
  if (swamMatch) return { value: 'SWaM Set-Aside', snippet: swamMatch[0], confidence: 'high' }
  return undefined
}

function findKeyword<T extends string>(
  text: string,
  table: [T, RegExp][],
  confidence: Confidence = 'needs-confirmation',
): ExtractedField<T> | undefined {
  for (const [value, re] of table) {
    const match = text.match(re)
    if (match) return { value, snippet: match[0].trim(), confidence }
  }
  return undefined
}

function findAllKeywords(text: string, table: [string, RegExp][]): string[] {
  return table.filter(([, re]) => re.test(text)).map(([label]) => label)
}

function findSquareFootage(text: string): ExtractedField<number> | undefined {
  const match = text.match(/([\d,]{3,7})\s*(?:square\s*feet|square\s*foot|sq\.?\s*ft\.?|sf)\b/i)
  if (!match) return undefined
  const value = Number(match[1].replace(/,/g, ''))
  if (!Number.isFinite(value) || value <= 0) return undefined
  return { value, snippet: match[0].trim(), confidence: 'high' }
}

function findFloors(text: string): ExtractedField<number> | undefined {
  const match = text.match(/\b(\d{1,2})\s*(?:story|stories|floors?)\b/i)
  if (!match) return undefined
  return { value: Number(match[1]), snippet: match[0].trim(), confidence: 'high' }
}

function findNumberOfBuildings(text: string): ExtractedField<number> | undefined {
  const match = text.match(/\b(\d{1,3})\s*buildings?\b/i)
  if (!match) return undefined
  return { value: Number(match[1]), snippet: match[0].trim(), confidence: 'needs-confirmation' }
}

function findRequiredEmployees(text: string): ExtractedField<number> | undefined {
  const match = text.match(
    /\b(?:minimum of|at least|no fewer than)?\s*(\d{1,3})\s*(?:full-?time )?(?:employees?|staff|personnel|custodians?)\b/i,
  )
  if (!match) return undefined
  return { value: Number(match[1]), snippet: match[0].trim(), confidence: 'needs-confirmation' }
}

function findTermMonths(text: string): ExtractedField<number> | undefined {
  const monthMatch = text.match(/\b(\d{1,3})\s*(?:month|months)\b(?!\s*old)/i)
  if (monthMatch) return { value: Number(monthMatch[1]), snippet: monthMatch[0].trim(), confidence: 'high' }
  const yearMatch = text.match(/\b(\d{1,2})\s*(?:year|years)\b/i)
  if (yearMatch) return { value: Number(yearMatch[1]) * 12, snippet: yearMatch[0].trim(), confidence: 'high' }
  return undefined
}

const MONTH_NAMES =
  '(January|February|March|April|May|June|July|August|September|October|November|December)'

function findDatesNear(text: string, labelRe: RegExp): ExtractedField<string> | undefined {
  const windowMatch = text.match(labelRe)
  const searchText = windowMatch ? text.slice(windowMatch.index, windowMatch.index! + 80) : ''
  if (!searchText) return undefined
  return parseDateString(searchText, windowMatch![0])
}

function parseDateString(text: string, labelSnippet?: string): ExtractedField<string> | undefined {
  const slashMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/)
  if (slashMatch) {
    const [snippet, m, d, y] = slashMatch
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    if (!Number.isNaN(date.getTime())) {
      return {
        value: date.toISOString().slice(0, 10),
        snippet: labelSnippet ? `${labelSnippet} ${snippet}` : snippet,
        confidence: 'high',
      }
    }
  }
  const namedMatch = text.match(new RegExp(`\\b${MONTH_NAMES}\\s+(\\d{1,2}),?\\s+(\\d{4})\\b`, 'i'))
  if (namedMatch) {
    const date = new Date(namedMatch[0])
    if (!Number.isNaN(date.getTime())) {
      return {
        value: date.toISOString().slice(0, 10),
        snippet: labelSnippet ? `${labelSnippet} ${namedMatch[0]}` : namedMatch[0],
        confidence: 'high',
      }
    }
  }
  return undefined
}

function findEmail(text: string): ExtractedField<string> | undefined {
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)
  if (!match) return undefined
  return { value: match[0], snippet: match[0], confidence: 'high' }
}

function findPhone(text: string): ExtractedField<string> | undefined {
  const match = text.match(/\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/)
  if (!match) return undefined
  return { value: match[0], snippet: match[0], confidence: 'high' }
}

function findSuppliesProvider(text: string): ExtractedField<'government' | 'contractor'> | undefined {
  const govProvides = text.match(
    /\b(government|agency|owner|customer)\s+(will|shall)?\s*(furnish|provide|supply)\b[^.]{0,60}(supplies|equipment|chemicals)/i,
  )
  if (govProvides) return { value: 'government', snippet: govProvides[0].trim(), confidence: 'needs-confirmation' }

  const contractorProvides = text.match(
    /\b(contractor|vendor|bidder)\s+(will|shall)?\s*(furnish|provide|supply)\b[^.]{0,60}(supplies|equipment|chemicals|ppe)/i,
  )
  if (contractorProvides)
    return { value: 'contractor', snippet: contractorProvides[0].trim(), confidence: 'needs-confirmation' }

  return undefined
}

function findBooleanRequirement(text: string, re: RegExp): ExtractedField<boolean> | undefined {
  const match = text.match(re)
  if (!match) return undefined
  return { value: true, snippet: match[0].trim(), confidence: 'high' }
}

function findCertifications(text: string): ExtractedField<string[]> | undefined {
  const known = ['ISSA CIMS', 'CIMS', 'Green Seal', 'OSHA 10', 'OSHA 30', 'BOMA']
  const found = known.filter((cert) => new RegExp(`\\b${cert.replace(/\s/g, '\\s')}\\b`, 'i').test(text))
  if (found.length === 0) return undefined
  return { value: found, snippet: found.join(', '), confidence: 'high' }
}

function findLicenses(text: string): ExtractedField<string[]> | undefined {
  const match = text.match(/\b(business license|contractor'?s? license|state license)\b[^.]{0,60}/i)
  if (!match) return undefined
  return { value: [match[0].trim()], snippet: match[0].trim(), confidence: 'needs-confirmation' }
}

function findOperatingHours(text: string): ExtractedField<string> | undefined {
  const match = text.match(/\b(\d{1,2}(:\d{2})?\s*[ap]\.?m\.?)\s*(to|-|–)\s*(\d{1,2}(:\d{2})?\s*[ap]\.?m\.?)\b/i)
  if (!match) return undefined
  return { value: match[0], snippet: match[0], confidence: 'high' }
}

function findOccupancyType(text: string): ExtractedField<string> | undefined {
  const match = text.match(/\b(24\/7|around[- ]the[- ]clock|single shift|multi-shift|business hours only)\b/i)
  if (!match) return undefined
  return { value: match[0], snippet: match[0], confidence: 'needs-confirmation' }
}

function findSpecialtyServices(text: string): ExtractedField<DetectedSpecialtyService[]> | undefined {
  const found: DetectedSpecialtyService[] = []
  for (const [id, name, re] of SPECIALTY_SERVICE_KEYWORDS) {
    const match = text.match(re)
    if (!match) continue
    const window = text.slice(match.index, match.index! + 100)
    const freq = findKeyword(window, SERVICE_FREQUENCY_KEYWORDS.map(([label, re]) => [label, re] as [string, RegExp]))
    found.push({ id, name, frequencyLabel: freq?.value ?? 'Frequency not specified' })
  }
  if (found.length === 0) return undefined
  return {
    value: found,
    snippet: found.map((f) => `${f.name} (${f.frequencyLabel})`).join('; '),
    confidence: 'needs-confirmation',
  }
}

/**
 * Best-effort heuristic extraction of estimate fields and contract context
 * from scope-of-work text. There is no backend/LLM in this app, so this is
 * plain regex and label matching — every applicable field is surfaced with
 * a confidence level for the user to review before it's applied to an
 * estimate, and contextual fields are never applied at all, only shown for
 * awareness.
 */
export function extractScopeOfWorkFields(rawText: string): ScopeOfWorkExtraction {
  const lines = cleanLines(rawText)
  const flatText = lines.join(' ')

  const startDate =
    findDatesNear(flatText, /period of performance|contract start|commencement date|start date/i) ??
    parseDateString(flatText)
  const endDate = findDatesNear(flatText, /period of performance end|expiration date|end date|through/i)
  const bidDueDate = findDatesNear(flatText, /bids? due|proposals? due|due date|closing date|submission deadline/i)

  const applicable: ApplicableFields = {
    customerName: findLabeledValue(lines, [
      'customer(?:\\s*name)?',
      'client(?:\\s*name)?',
      'company(?:\\s*name)?',
      'bidder(?:\\s*name)?',
      'contractor(?:\\s*name)?',
    ]),
    agency: findLabeledValue(lines, ['agency', 'contracting agency', 'issuing agency', 'department', 'owner']),
    contractNumber: findLabeledValue(lines, ['contract\\s*(?:no\\.?|number|#)'], 30),
    contractType: findContractType(flatText),
    facilityName: findLabeledValue(lines, [
      'building(?:\\s*name)?',
      'facility(?:\\s*name)?',
      'site(?:\\s*name)?',
      'property(?:\\s*name)?',
    ]),
    address: findLabeledValue(lines, ['address', 'location', 'site address']),
    buildingType: findKeyword(flatText, BUILDING_TYPE_KEYWORDS, 'needs-confirmation'),
    floors: findFloors(flatText),
    squareFootage: findSquareFootage(flatText),
    frequency: findKeyword(flatText, FREQUENCY_KEYWORDS, 'needs-confirmation'),
    termMonths: findTermMonths(flatText),
    startDate,
    contactName: findLabeledValue(lines, ['contact(?:\\s*name)?', 'point of contact', 'poc']),
    contactEmail: findEmail(flatText),
    contactPhone: findPhone(flatText),
    requiredEmployees: findRequiredEmployees(flatText),
    suppliesProvider: findSuppliesProvider(flatText),
    specialtyServices: findSpecialtyServices(flatText),
  }

  const contextual: ContextualFields = {
    solicitationNumber: findLabeledValue(lines, [
      'solicitation\\s*(?:no\\.?|number|#)',
      'rfp\\s*(?:no\\.?|number|#)',
      'ifb\\s*(?:no\\.?|number|#)',
    ]),
    endDate,
    bidDueDate,
    numberOfBuildings: findNumberOfBuildings(flatText),
    operatingHours: findOperatingHours(flatText),
    occupancyType: findOccupancyType(flatText),
    scopeTasks: (() => {
      const tasks = findAllKeywords(flatText, SCOPE_TASK_KEYWORDS)
      return tasks.length ? { value: tasks, snippet: tasks.join(', '), confidence: 'high' } : undefined
    })(),
    supervisorRequired: findBooleanRequirement(flatText, /\bsupervisor (shall|must|is required)\b/i),
    minimumStaffing: findLabeledValue(lines, ['minimum staffing', 'staffing level']),
    certifications: findCertifications(flatText),
    backgroundChecksRequired: findBooleanRequirement(
      flatText,
      /\bbackground (check|screening|investigation)s?\s*(shall be|is|are)?\s*required\b|\bcriminal background check\b/i,
    ),
    securityClearanceRequired: findBooleanRequirement(flatText, /\bsecurity clearance\b/i),
    insuranceRequired: findBooleanRequirement(
      flatText,
      /\b(general liability|commercial) insurance\b|\bcertificate of insurance\b|\binsurance (coverage|requirements?)\b/i,
    ),
    bondRequired: findBooleanRequirement(flatText, /\b(performance|payment|surety) bonds?\b/i),
    licensesRequired: findLicenses(flatText),
  }

  return { applicable, contextual }
}

/** Turns detected compliance/staffing/materials signals into plain-English risk notes for the bid summary. */
export function buildRiskNotes(extraction: ScopeOfWorkExtraction): string[] {
  const { applicable, contextual } = extraction
  const notes: string[] = []

  if (contextual.backgroundChecksRequired?.value) notes.push('Background checks required for all personnel')
  if (contextual.securityClearanceRequired?.value) notes.push('Security clearance required')
  if (contextual.bondRequired?.value) notes.push('Performance/payment bond required')
  if (contextual.insuranceRequired?.value) notes.push('Certificate of insurance required')
  if (contextual.supervisorRequired?.value) notes.push('On-site supervisor required during all shifts')
  if (contextual.certifications?.value.length)
    notes.push(`Certifications required: ${contextual.certifications.value.join(', ')}`)
  if (contextual.licensesRequired?.value.length)
    notes.push(`Licensing required: ${contextual.licensesRequired.value.join(', ')}`)
  if (applicable.suppliesProvider?.value === 'contractor')
    notes.push('Contractor must supply chemicals, equipment, and consumables')
  if (applicable.frequency?.value === '7x_week') notes.push('Weekend cleaning required (7 days/week)')

  return notes
}

/** Turns non-risk scope/context signals into plain-English notes for the job summary. */
export function buildScopeNotes(extraction: ScopeOfWorkExtraction): string[] {
  const { contextual } = extraction
  const notes: string[] = []

  if (contextual.scopeTasks?.value.length)
    notes.push(`Scope tasks: ${contextual.scopeTasks.value.join(', ')}`)
  if (contextual.numberOfBuildings?.value) notes.push(`Spans ${contextual.numberOfBuildings.value} buildings`)
  if (contextual.operatingHours?.value) notes.push(`Operating hours: ${contextual.operatingHours.value}`)
  if (contextual.occupancyType?.value) notes.push(`Occupancy: ${contextual.occupancyType.value}`)
  if (contextual.minimumStaffing?.value) notes.push(`Minimum staffing: ${contextual.minimumStaffing.value}`)

  return notes
}
