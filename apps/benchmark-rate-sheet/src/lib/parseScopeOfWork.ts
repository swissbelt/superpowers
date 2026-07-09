import { CONTRACT_TYPES } from '../data/defaults'
import type { BuildingType, CleaningFrequency } from '../types'

export interface ExtractedField<T> {
  value: T
  /** The line (or nearby text) the value was pulled from, shown to the user for verification. */
  snippet: string
}

export interface ScopeOfWorkExtraction {
  customerName?: ExtractedField<string>
  agency?: ExtractedField<string>
  contractNumber?: ExtractedField<string>
  contractType?: ExtractedField<string>
  buildingName?: ExtractedField<string>
  address?: ExtractedField<string>
  buildingType?: ExtractedField<BuildingType>
  floors?: ExtractedField<number>
  squareFootage?: ExtractedField<number>
  frequency?: ExtractedField<CleaningFrequency>
  termMonths?: ExtractedField<number>
  startDate?: ExtractedField<string>
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
      return { value, snippet: lines[i] }
    }
    if (labelOnlyRe.test(lines[i]) && lines[i + 1]) {
      const value = lines[i + 1].trim().slice(0, maxLength)
      if (value) return { value, snippet: `${lines[i]} ${lines[i + 1]}` }
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
  ['1x_week', /\b(once a week|1x per week|weekly service|weekly)\b/i],
]

function findContractType(text: string): ExtractedField<string> | undefined {
  for (const type of CONTRACT_TYPES) {
    const keyword = type.split(' ')[0]
    const re = new RegExp(`\\b${keyword}\\b`, 'i')
    const match = text.match(re)
    if (match) {
      return { value: type, snippet: match[0] }
    }
  }
  const swamMatch = text.match(/\bSWaM\b/i)
  if (swamMatch) return { value: 'SWaM Set-Aside', snippet: swamMatch[0] }
  return undefined
}

function findKeyword<T extends string>(
  text: string,
  table: [T, RegExp][],
): ExtractedField<T> | undefined {
  for (const [value, re] of table) {
    const match = text.match(re)
    if (match) return { value, snippet: match[0].trim() }
  }
  return undefined
}

function findSquareFootage(text: string): ExtractedField<number> | undefined {
  const match = text.match(/([\d,]{3,7})\s*(?:square\s*feet|square\s*foot|sq\.?\s*ft\.?|sf)\b/i)
  if (!match) return undefined
  const value = Number(match[1].replace(/,/g, ''))
  if (!Number.isFinite(value) || value <= 0) return undefined
  return { value, snippet: match[0].trim() }
}

function findFloors(text: string): ExtractedField<number> | undefined {
  const match = text.match(/\b(\d{1,2})\s*(?:story|stories|floors?)\b/i)
  if (!match) return undefined
  return { value: Number(match[1]), snippet: match[0].trim() }
}

function findTermMonths(text: string): ExtractedField<number> | undefined {
  const monthMatch = text.match(/\b(\d{1,3})\s*(?:month|months)\b(?!\s*old)/i)
  if (monthMatch) return { value: Number(monthMatch[1]), snippet: monthMatch[0].trim() }
  const yearMatch = text.match(/\b(\d{1,2})\s*(?:year|years)\b/i)
  if (yearMatch) return { value: Number(yearMatch[1]) * 12, snippet: yearMatch[0].trim() }
  return undefined
}

const MONTH_NAMES =
  '(January|February|March|April|May|June|July|August|September|October|November|December)'

function findStartDate(text: string): ExtractedField<string> | undefined {
  const slashMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/)
  if (slashMatch) {
    const [snippet, m, d, y] = slashMatch
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    if (!Number.isNaN(date.getTime())) {
      return { value: date.toISOString().slice(0, 10), snippet }
    }
  }
  const namedMatch = text.match(new RegExp(`\\b${MONTH_NAMES}\\s+(\\d{1,2}),?\\s+(\\d{4})\\b`, 'i'))
  if (namedMatch) {
    const date = new Date(namedMatch[0])
    if (!Number.isNaN(date.getTime())) {
      return { value: date.toISOString().slice(0, 10), snippet: namedMatch[0] }
    }
  }
  return undefined
}

/**
 * Best-effort heuristic extraction of estimate fields from scope-of-work
 * text. There is no backend/LLM in this app, so this is plain regex and
 * label matching — always surfaced to the user for review before it's
 * applied to an estimate, never applied silently.
 */
export function extractScopeOfWorkFields(rawText: string): ScopeOfWorkExtraction {
  const lines = cleanLines(rawText)
  const flatText = lines.join(' ')

  return {
    customerName: findLabeledValue(lines, [
      'customer(?:\\s*name)?',
      'client(?:\\s*name)?',
      'company(?:\\s*name)?',
      'bidder(?:\\s*name)?',
      'contractor(?:\\s*name)?',
    ]),
    agency: findLabeledValue(lines, [
      'agency',
      'contracting agency',
      'issuing agency',
      'department',
      'owner'
    ]),
    contractNumber: findLabeledValue(
      lines,
      ['contract\\s*(?:no\\.?|number|#)', 'solicitation\\s*(?:no\\.?|number|#)', 'rfp\\s*(?:no\\.?|number|#)', 'ifb\\s*(?:no\\.?|number|#)'],
      30,
    ),
    contractType: findContractType(flatText),
    buildingName: findLabeledValue(lines, [
      'building(?:\\s*name)?',
      'facility(?:\\s*name)?',
      'site(?:\\s*name)?',
      'property(?:\\s*name)?',
    ]),
    address: findLabeledValue(lines, ['address', 'location', 'site address']),
    buildingType: findKeyword(flatText, BUILDING_TYPE_KEYWORDS),
    floors: findFloors(flatText),
    squareFootage: findSquareFootage(flatText),
    frequency: findKeyword(flatText, FREQUENCY_KEYWORDS),
    termMonths: findTermMonths(flatText),
    startDate: findStartDate(flatText),
  }
}
