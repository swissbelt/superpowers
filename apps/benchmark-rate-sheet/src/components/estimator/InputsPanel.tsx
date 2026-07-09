import { useAppState } from '../../context/AppStateContext'
import { Section } from '../inputs/Section'
import { TextField } from '../inputs/TextField'
import { Select } from '../inputs/Select'
import { NumberField } from '../inputs/NumberField'
import { Slider } from '../inputs/Slider'
import { Switch } from '../inputs/Switch'
import { CONTRACT_TYPES } from '../../data/defaults'
import { BUILDING_TYPE_LABELS, FREQUENCY_LABELS, type BuildingType, type CleaningFrequency } from '../../types'
import { formatCurrency } from '../../lib/format'
import {
  Users,
  FileText,
  Building2,
  CalendarClock,
  Ruler,
  DollarSign,
  Gauge,
  Car,
  SprayCan,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  Receipt,
  Percent,
  Landmark,
} from 'lucide-react'

export function InputsPanel() {
  const { data, setCurrentInputs } = useAppState()
  const inputs = data.currentInputs

  const update = (patch: Partial<typeof inputs>) =>
    setCurrentInputs((prev) => ({ ...prev, ...patch }))

  return (
    <div className="space-y-4">
      <Section title="Customer Information" icon={<Users size={16} />}>
        <TextField
          label="Customer Name"
          value={inputs.customer.name}
          onChange={(v) => update({ customer: { ...inputs.customer, name: v } })}
          placeholder="Acme Corp"
        />
        <TextField
          label="Contact Name"
          value={inputs.customer.contactName}
          onChange={(v) => update({ customer: { ...inputs.customer, contactName: v } })}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Email"
            type="email"
            value={inputs.customer.email}
            onChange={(v) => update({ customer: { ...inputs.customer, email: v } })}
          />
          <TextField
            label="Phone"
            type="tel"
            value={inputs.customer.phone}
            onChange={(v) => update({ customer: { ...inputs.customer, phone: v } })}
          />
        </div>
      </Section>

      <Section title="Contract Information" icon={<FileText size={16} />}>
        <TextField
          label="Contracting Agency"
          value={inputs.contract.agency}
          onChange={(v) => update({ contract: { ...inputs.contract, agency: v } })}
        />
        <TextField
          label="Contract Number"
          value={inputs.contract.contractNumber}
          onChange={(v) => update({ contract: { ...inputs.contract, contractNumber: v } })}
        />
        <Select
          label="Contract Type"
          value={inputs.contract.contractType}
          options={CONTRACT_TYPES.map((t) => ({ value: t, label: t }))}
          onChange={(v) => update({ contract: { ...inputs.contract, contractType: v } })}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Start Date"
            type="date"
            value={inputs.contract.startDate}
            onChange={(v) => update({ contract: { ...inputs.contract, startDate: v } })}
          />
          <NumberField
            label="Term (months)"
            value={inputs.contract.termMonths}
            min={1}
            onChange={(v) => update({ contract: { ...inputs.contract, termMonths: v } })}
          />
        </div>
      </Section>

      <Section title="Building Information" icon={<Building2 size={16} />}>
        <TextField
          label="Building Name"
          value={inputs.building.name}
          onChange={(v) => update({ building: { ...inputs.building, name: v } })}
        />
        <TextField
          label="Address"
          value={inputs.building.address}
          onChange={(v) => update({ building: { ...inputs.building, address: v } })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Building Type"
            value={inputs.building.buildingType}
            options={Object.entries(BUILDING_TYPE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            onChange={(v) => {
              const buildingType = v as BuildingType
              update({
                building: { ...inputs.building, buildingType },
                productivityOverride: data.productivity[buildingType],
              })
            }}
          />
          <NumberField
            label="Floors"
            value={inputs.building.floors}
            min={1}
            onChange={(v) => update({ building: { ...inputs.building, floors: v } })}
          />
        </div>
      </Section>

      <Section title="Cleaning Frequency" icon={<CalendarClock size={16} />}>
        <Select
          label="Frequency"
          value={inputs.frequency}
          options={Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
          onChange={(v) => update({ frequency: v as CleaningFrequency })}
        />
      </Section>

      <Section title="Square Footage" icon={<Ruler size={16} />}>
        <Slider
          label="Total Cleanable Square Footage"
          value={inputs.squareFootage}
          min={500}
          max={250000}
          step={500}
          onChange={(v) => update({ squareFootage: v })}
          formatValue={(v) => `${v.toLocaleString()} sq ft`}
        />
      </Section>

      <Section title="Labor Rate" icon={<DollarSign size={16} />}>
        <Slider
          label="Hourly Labor Rate"
          value={inputs.laborRate}
          min={7.25}
          max={40}
          step={0.25}
          onChange={(v) => update({ laborRate: v })}
          formatValue={(v) => formatCurrency(v)}
        />
      </Section>

      <Section title="Productivity (sq ft / hour)" icon={<Gauge size={16} />}>
        <Switch
          label="Use Productivity Library"
          description="Pulls the rate from the Productivity Library for this building type"
          checked={inputs.useLibraryProductivity}
          onChange={(v) => update({ useLibraryProductivity: v })}
        />
        {inputs.useLibraryProductivity ? (
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            {BUILDING_TYPE_LABELS[inputs.building.buildingType]} rate:{' '}
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
              {data.productivity[inputs.building.buildingType].toLocaleString()} sq ft/hr
            </span>
          </div>
        ) : (
          <Slider
            label="Manual Productivity Rate"
            value={inputs.productivityOverride}
            min={500}
            max={8000}
            step={50}
            onChange={(v) => update({ productivityOverride: v })}
            formatValue={(v) => `${v.toLocaleString()} sq ft/hr`}
          />
        )}
      </Section>

      <Section title="Travel Time" icon={<Car size={16} />}>
        <Slider
          label="Travel Time Per Visit"
          value={inputs.travelTimeMinutes}
          min={0}
          max={120}
          step={5}
          onChange={(v) => update({ travelTimeMinutes: v })}
          formatValue={(v) => `${v} min`}
        />
      </Section>

      <Section title="Mileage" icon={<Car size={16} />}>
        <Slider
          label="Round-Trip Mileage Per Visit"
          value={inputs.mileagePerVisit}
          min={0}
          max={150}
          step={1}
          onChange={(v) => update({ mileagePerVisit: v })}
          formatValue={(v) => `${v} mi`}
        />
      </Section>

      <Section title="Supplies" icon={<SprayCan size={16} />}>
        <Switch
          label="Client Provides Supplies"
          checked={inputs.clientProvidesSupplies}
          onChange={(v) => update({ clientProvidesSupplies: v })}
        />
        {!inputs.clientProvidesSupplies && (
          <Slider
            label="Supplies Cost"
            value={inputs.suppliesCostPerSqFt}
            min={0}
            max={0.1}
            step={0.001}
            onChange={(v) => update({ suppliesCostPerSqFt: v })}
            formatValue={(v) => `${formatCurrency(v, 3)} / sq ft`}
          />
        )}
      </Section>

      <Section title="Specialty Services" icon={<Sparkles size={16} />} defaultOpen={false}>
        {inputs.specialtyServices.map((service) => (
          <div key={service.id} className="space-y-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800">
            <Switch
              label={service.name}
              checked={service.enabled}
              onChange={(checked) =>
                update({
                  specialtyServices: inputs.specialtyServices.map((s) =>
                    s.id === service.id ? { ...s, enabled: checked } : s,
                  ),
                })
              }
            />
            {service.enabled && (
              <NumberField
                label="Monthly Cost"
                value={service.costPerMonth}
                min={0}
                prefix="$"
                onChange={(v) =>
                  update({
                    specialtyServices: inputs.specialtyServices.map((s) =>
                      s.id === service.id ? { ...s, costPerMonth: v } : s,
                    ),
                  })
                }
              />
            )}
          </div>
        ))}
      </Section>

      <Section title="Insurance Allocation" icon={<ShieldCheck size={16} />}>
        <Slider
          label="Allocated Share of Monthly Insurance"
          value={inputs.insuranceAllocationPercent}
          min={0}
          max={200}
          step={5}
          onChange={(v) => update({ insuranceAllocationPercent: v })}
          formatValue={(v) => `${v}%`}
        />
      </Section>

      <Section title="Background Checks" icon={<BadgeCheck size={16} />}>
        <NumberField
          label="Number of Employees on Site"
          value={inputs.numberOfEmployees}
          min={0}
          onChange={(v) => update({ numberOfEmployees: v })}
        />
        <NumberField
          label="Background Check Cost / Employee (annual)"
          value={inputs.backgroundCheckCostPerEmployee}
          min={0}
          prefix="$"
          onChange={(v) => update({ backgroundCheckCostPerEmployee: v })}
        />
      </Section>

      <Section title="eVA Fees" icon={<Landmark size={16} />}>
        <Slider
          label="eVA Transaction Fee"
          value={inputs.evaFeePercent}
          min={0}
          max={5}
          step={0.05}
          onChange={(v) => update({ evaFeePercent: v })}
          formatValue={(v) => `${v.toFixed(2)}%`}
        />
      </Section>

      <Section title="Desired Profit Margin" icon={<Percent size={16} />}>
        <Slider
          label="Target Gross Margin"
          value={inputs.desiredProfitMarginPercent}
          min={0}
          max={60}
          step={1}
          onChange={(v) => update({ desiredProfitMarginPercent: v })}
          formatValue={(v) => `${v}%`}
        />
      </Section>

      <Section title="Minimum Price Floor" icon={<Receipt size={16} />}>
        <NumberField
          label="Minimum Price Per Visit"
          value={inputs.minimumPriceFloor}
          min={0}
          prefix="$"
          onChange={(v) => update({ minimumPriceFloor: v })}
        />
      </Section>
    </div>
  )
}
