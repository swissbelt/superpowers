import { BUILDING_TYPE_LABELS, FREQUENCY_LABELS, type EstimateInputs } from '../types'

export interface JobSummary {
  headline: string
  bullets: string[]
}

/**
 * Plain-language description of what the job actually involves, built
 * entirely from the current estimate inputs (always available, whether the
 * estimate came from a document import or manual entry). Notes detected
 * from an imported document (scope tasks, staffing, operating hours, etc.)
 * are folded in as extra bullets when present.
 */
export function generateJobSummary(inputs: EstimateInputs, scopeNotes: string[] = []): JobSummary {
  const buildingLabel = BUILDING_TYPE_LABELS[inputs.building.buildingType]
  const frequencyLabel = FREQUENCY_LABELS[inputs.frequency].toLowerCase()
  const sqft = inputs.squareFootage.toLocaleString()

  const location = inputs.building.name
    ? `${inputs.building.name}${inputs.building.address ? ` (${inputs.building.address})` : ''}`
    : inputs.building.address || null

  const floorsPhrase = inputs.building.floors > 1 ? ` across ${inputs.building.floors} floors` : ''

  const headline = location
    ? `Servicing ${sqft} sq ft at ${location} — a ${buildingLabel.toLowerCase()} building${floorsPhrase} — ${frequencyLabel}.`
    : `Servicing a ${sqft} sq ft ${buildingLabel.toLowerCase()} building${floorsPhrase}, ${frequencyLabel}.`

  const bullets: string[] = []

  const enabledSpecialty = inputs.specialtyServices.filter((s) => s.enabled)
  if (enabledSpecialty.length > 0) {
    bullets.push(
      `Additional services: ${enabledSpecialty
        .map((s) => (s.detectedFrequencyLabel ? `${s.name} (${s.detectedFrequencyLabel})` : s.name))
        .join(', ')}`,
    )
  }

  bullets.push(
    inputs.clientProvidesSupplies
      ? 'Client provides cleaning supplies and equipment'
      : 'Contractor provides all cleaning supplies and equipment',
  )

  bullets.push(
    `Staffing: ${inputs.numberOfEmployees} employee${inputs.numberOfEmployees === 1 ? '' : 's'}`,
  )

  if (inputs.contract.contractType) {
    bullets.push(
      `${inputs.contract.contractType} contract${inputs.contract.termMonths ? `, ${inputs.contract.termMonths}-month term` : ''}`,
    )
  }

  bullets.push(...scopeNotes)

  return { headline, bullets }
}
