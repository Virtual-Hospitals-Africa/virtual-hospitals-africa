import { JSX } from 'preact'
import { PrescriptionFrequencies } from '../shared/prescription.ts'
import type { ParsedDose, TimeSpecification } from '../backend/recommended_doses/shared.ts'

export type MedicineRecommendation = {
  atc: string
  form: string
  route: string
  aware: null | 'Watch' | 'Access' | 'Reserve'
  acute_chronic: null | 'Acute' | 'Chronic'
  prescriber: string | null
  medicine: {
    name: string
    alternate_name?: string
    ingredients: { name: string; alternate_name?: string; dosage?: { value: number; units: string } }[]
  }
  schedules: ParsedDose[]
  raw_dose: string
  raw_dose_interval: string
  raw_duration: string | null
  publication: string
  chapter_name: string
  chapter_number: string
  adult_children: string
  section_number: string
  disorder_number: string | null
  disorder: string
}

function formatTimeSpec(spec: TimeSpecification): string {
  const value = Array.isArray(spec.value) ? spec.value.join('–') : spec.value
  const plural = (Array.isArray(spec.value) ? spec.value[1] : spec.value) === 1 ? '' : 's'
  return `${value} ${spec.units}${plural}`
}

function FrequencyText({ frequency }: { frequency: ParsedDose['frequency'] }): JSX.Element | null {
  if (!frequency) return null
  if (typeof frequency === 'string') {
    const text = PrescriptionFrequencies[frequency as keyof typeof PrescriptionFrequencies]
    return <span class='font-medium'>{text ?? frequency}</span>
  }
  if (Array.isArray(frequency)) {
    const texts = frequency.map((f) => PrescriptionFrequencies[f as keyof typeof PrescriptionFrequencies] ?? f)
    return <span class='font-medium'>{texts.join(' or ')}</span>
  }
  if ('every' in frequency) {
    return <span class='font-medium'>every {formatTimeSpec(frequency.every)}</span>
  }
  return null
}

function resolvePerKg(per_size: ParsedDose['per_size']): number | null {
  if (per_size === 'kg') return 1
  if (per_size === 'm2') return null
  if (per_size && typeof per_size === 'object' && 'kg' in per_size) return per_size.kg
  return null
}

function DoseValue({ dose, weight_kg }: { dose: ParsedDose; weight_kg?: number }): JSX.Element | null {
  const { value, units, per_size, minimum, maximum } = dose
  if (value === undefined && minimum === undefined && maximum === undefined) return null

  const kg_factor = resolvePerKg(per_size)
  const is_per_kg = kg_factor !== null

  const display_val = (() => {
    const base = value ?? ((minimum !== undefined && maximum !== undefined) ? `${minimum}–${maximum}` : minimum ?? maximum)
    if (base === undefined) return null
    if (is_per_kg && weight_kg) {
      const total = typeof base === 'number' ? +(base * weight_kg * kg_factor).toFixed(2) : base
      return (
        <>
          <strong>{total}{units}</strong>
          <span class='text-gray-500 text-sm ml-1'>({base}{units}/kg)</span>
        </>
      )
    }
    return <strong>{base}{units}</strong>
  })()

  if (display_val === null) return null
  return <span>{display_val}</span>
}

function TitrateRate({ rate }: { rate: NonNullable<NonNullable<ParsedDose['titrate']>['rate']> }): JSX.Element {
  const { increment, per_time, per_size } = rate
  const inc_text = increment === 'slow' ? 'slowly' : `${increment.value}${increment.units}`
  const per_text = per_time ? ` per ${formatTimeSpec(per_time)}` : ''
  const size_text = per_size === 'kg' ? '/kg' : per_size === 'm2' ? '/m²' : ''
  return <span>by {inc_text}{size_text}{per_text}</span>
}

function Titrate({
  titrate,
  weight_kg,
}: {
  titrate: NonNullable<ParsedDose['titrate']>
  weight_kg?: number
}): JSX.Element {
  return (
    <span class='italic text-indigo-700'>
      titrate
      {titrate.rate && (
        <>
          <TitrateRate rate={titrate.rate} />
        </>
      )}
      {titrate.to_effect && ' to effect'}
      {titrate.if_necessary && ' if necessary'}
      {titrate.min && (
        <>
          {' '}min <Schedule dose={titrate.min} weight_kg={weight_kg} />
        </>
      )}
      {titrate.max && (
        <>
          {' '}max <Schedule dose={titrate.max} weight_kg={weight_kg} />
        </>
      )}
      {titrate.low && (
        <>
          {' '}low <Schedule dose={titrate.low} weight_kg={weight_kg} />
        </>
      )}
      {titrate.high && (
        <>
          {' '}high <Schedule dose={titrate.high} weight_kg={weight_kg} />
        </>
      )}
    </span>
  )
}

function Schedule({ dose, weight_kg }: { dose: ParsedDose; weight_kg?: number }): JSX.Element {
  const { frequency, slowly, special_instructions, duration, titrate } = dose

  const freq_el = frequency
    ? (
      <>
        {' '}
        <FrequencyText frequency={frequency} />
      </>
    )
    : null

  const duration_el = duration ? <span class='text-gray-600'>over {formatTimeSpec(duration)}</span> : null
  const slowly_el = slowly ? <span class='text-amber-700 font-medium'>slowly</span> : null
  const instructions_el = special_instructions ? <span class='text-gray-600 italic'>— {special_instructions}</span> : null

  // Low / high range
  if (dose.low?.length || dose.high?.length) {
    const low_dose = dose.low?.[0]
    const high_dose = dose.high?.[0]
    return (
      <span>
        {low_dose && <Schedule dose={{ ...low_dose, frequency: undefined }} weight_kg={weight_kg} />}
        {low_dose && high_dose && <span class='mx-1'>–</span>}
        {high_dose && <Schedule dose={{ ...high_dose, frequency: undefined }} weight_kg={weight_kg} />}
        {freq_el}
        {duration_el}
        {slowly_el}
        {instructions_el}
      </span>
    )
  }

  // Titrate
  if (titrate) {
    return (
      <span>
        {dose.value !== undefined && (
          <>
            <DoseValue dose={dose} weight_kg={weight_kg} />
            {' '}
          </>
        )}
        <Titrate titrate={titrate} weight_kg={weight_kg} />
        {freq_el}
        {duration_el}
        {slowly_el}
        {instructions_el}
      </span>
    )
  }

  // Simple
  return (
    <span>
      <DoseValue dose={dose} weight_kg={weight_kg} />
      {slowly_el}
      {freq_el}
      {duration_el}
      {instructions_el}
    </span>
  )
}

function AwareBadge({ aware }: { aware: MedicineRecommendation['aware'] }): JSX.Element | null {
  if (!aware) return null
  const colours: Record<string, string> = {
    Access: 'bg-green-100 text-green-800',
    Watch: 'bg-yellow-100 text-yellow-800',
    Reserve: 'bg-red-100 text-red-800',
  }
  return (
    <span class={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${colours[aware] ?? 'bg-gray-100 text-gray-700'}`}>
      {aware}
    </span>
  )
}

export function RecommendedMedication({
  medicine: med,
  weight_kg,
}: {
  medicine: MedicineRecommendation
  weight_kg?: number
}): JSX.Element {
  return (
    <div class='border border-gray-200 rounded-lg p-4 flex flex-col gap-3'>
      {/* Header */}
      <div class='flex flex-col gap-1'>
        <div class='flex items-center gap-2 flex-wrap'>
          <h3 class='text-base font-semibold text-gray-900'>{med.medicine.name}</h3>
          {med.medicine.alternate_name && <span class='text-sm text-gray-500'>({med.medicine.alternate_name})</span>}
          <AwareBadge aware={med.aware} />
          {med.acute_chronic && (
            <span class='inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800'>
              {med.acute_chronic}
            </span>
          )}
        </div>
        <p class='text-sm text-gray-500'>
          {med.form} · {med.route}
          {med.prescriber && <>· {med.prescriber}</>}
        </p>
        <p class='text-xs text-gray-400'>
          {med.chapter_number}. {med.chapter_name}
          {med.disorder_number && ` › ${med.disorder_number}`} — {med.disorder}
        </p>
      </div>

      {/* Schedules */}
      <div class='flex flex-col gap-2'>
        {med.schedules.map((schedule, i) => (
          <div key={i} class='text-sm text-gray-800 bg-gray-50 rounded px-3 py-2'>
            {schedule.age_classifier && <span class='text-xs uppercase tracking-wide text-gray-400 mr-2'>[{schedule.age_classifier}]</span>}
            <Schedule dose={schedule} weight_kg={weight_kg} />
          </div>
        ))}
      </div>

      {/* Raw dose fallback/reference */}
      <p class='text-xs text-gray-400'>
        Raw: {med.raw_dose} · {med.raw_dose_interval}
        {med.raw_duration && ` · ${med.raw_duration}`}
      </p>
    </div>
  )
}
