import { assert } from 'std/assert/assert.ts'
import memoize from '../util/memoize.ts'
import isNumber from '../util/isNumber.ts'
import { MedicationDetails, MedicationSchedule } from '../types.ts'
import { unpluralize } from '../util/pluralize.ts'

export const Dosages: [string, number][] = [
  ['¼', 0.25],
  ['½', 0.5],
  ['1', 1],
  ['2', 2],
  ['3', 3],
  ['4', 4],
  ['5', 5],
  ['6', 6],
  ['7', 7],
  ['8', 8],
  ['9', 9],
  ['10', 10],
]

function dosageText(dosage: number): string {
  const matching = Dosages.find(([, value]) => value === dosage)
  assert(matching)
  return matching[0]
}

export const IntakeFrequencies = {
  ac: 'before meals',
  am: 'morning',
  bd: '2 times daily',
  nocte: 'every night',
  od: 'once a day',
  pm: 'afternoon or evening',
  q15: 'every 15 minutes',
  q30: 'every 30 minutes',
  q1h: 'every hour',
  q2h: 'every 2 hours',
  q4h: 'every 4 hours',
  q6h: 'every 6 hours',
  q8h: 'every 8 hours',
  qd: 'every day',
  qid: '4 times a day',
  qod: 'alternate days',
  qs: 'sufficient enough quantity',
  mane: 'morning',
  qmane: 'every morning',
  qn: 'every night',
  stat: 'immediately, now',
  tds: '3 times a day',
  q24h: 'every 24 hours',
  q30h: 'every 30 hours',
  q48h: 'every 48 hours',
  q72h: 'every 72 hours',
  hs: 'at bedtime  ',
  qhs: 'daily at bedtime',
  qw: 'once a week',
  bw: 'twice a week',
  tw: 'three times a week',
  qm: 'once a month',
  bm: 'twice a month',
  tm: 'three times a month',
  prn: 'when necessary',
}

export function intakeFrequencyText(frequency: string): string {
  assertIntakeFrequency(frequency)
  return IntakeFrequencies[frequency]
}

type IntakeFrequency = keyof typeof IntakeFrequencies

export function isIntakeFrequency(
  frequency: string,
): frequency is IntakeFrequency {
  return frequency in IntakeFrequencies
}

export function assertIntakeFrequency(
  frequency: string,
): asserts frequency is IntakeFrequency {
  assert(isIntakeFrequency(frequency))
}

export const IntakeDosesPerDay = {
  ac: 3,
  am: 1,
  bd: 2,
  nocte: 1,
  od: 1,
  pm: 1,
  q15: 96,
  q30: 48,
  q1h: 24,
  q2h: 12,
  q4h: 6,
  q6h: 4,
  q8h: 3,
  qd: 1,
  qid: 4,
  qod: 0.5,
  qs: 1,
  mane: 1,
  qmane: 1,
  qn: 1,
  stat: 1,
  tds: 3,
  q24h: 1,
  q30h: 0.8,
  q48h: 0.5,
  q72h: 1 / 3,
  hs: 1,
  qhs: 1,
  qw: 1 / 7,
  bw: 2 / 7,
  tw: 3 / 7,
  qm: 1 / 30,
  bm: 2 / 30,
  tm: 3 / 30,
  prn: 1,
} satisfies {
  [frequency in IntakeFrequency]: number
}

type DosageDisplayParams = {
  dosage_text?: string
  dosage: number
  totalDosageMultiplier?: number
  strength_numerator: number
  strength_denominator: number
  strength_denominator_unit: string
  strength_denominator_is_units: boolean
  strength_numerator_unit: string
}

export const denominatorPlural = memoize(
  (
    { strength_denominator_unit, strength_denominator_is_units }: {
      strength_denominator_unit: string
      strength_denominator_is_units: boolean
    },
  ) => {
    assert(strength_denominator_unit)
    if (strength_denominator_is_units) return strength_denominator_unit
    if (strength_denominator_unit === 'SUPPOSITORY') return 'SUPPOSITORIES'
    return strength_denominator_unit + 'S'
  },
)

export function dosageDisplay(params: DosageDisplayParams) {
  const {
    strength_numerator,
    strength_denominator,
    strength_numerator_unit,
    strength_denominator_unit,
    strength_denominator_is_units,
    dosage_text,
    dosage,
    totalDosageMultiplier,
  } = params
  const numeric_strength = isNumber(strength_numerator)
    ? strength_numerator
    : parseFloat(strength_numerator)
  assert(numeric_strength)
  const numeric_strength_denominator = isNumber(strength_denominator)
    ? strength_denominator
    : parseFloat(strength_denominator)
  assert(numeric_strength_denominator)

  const single_dose = dosage * numeric_strength_denominator
  const totalDosage = totalDosageMultiplier
    ? Math.ceil(totalDosageMultiplier * single_dose)
    : single_dose

  let display = totalDosageMultiplier
    ? String(totalDosage)
    : (strength_denominator === 1
      ? (dosage_text ?? dosageText(dosage))
      : String(single_dose))
  if (!strength_denominator_is_units) {
    display += ' '
  }
  const doseToCompare = totalDosageMultiplier ? totalDosage : dosage
  display += doseToCompare > 1
    ? denominatorPlural(params)
    : strength_denominator_unit
  display += ` (${numeric_strength * dosage}${strength_numerator_unit})`

  return display
}

export function containerLabels(form: string) {
  switch (form) {
    case 'TABLET':
    case 'TABLET, COATED':
      return { size: 'Tablets per box', number_of: 'Number of boxes' }
    case 'CAPSULE':
      return { size: 'Capsules per box', number_of: 'Number of boxes' }
    case 'SOLUTION':
    case 'INJECTABLE':
      return { size: 'Bottle size', number_of: 'Number of bottles' }
    default:
      return { size: 'Container size', number_of: 'Number of containers' }
  }
}

// 20MCG/INFUSION
export function strengthDisplay({
  strength_numerator,
  strength_numerator_unit,
  strength_denominator,
  strength_denominator_unit,
  separator,
}: {
  strength_numerator: number
  strength_numerator_unit: string
  strength_denominator: number
  strength_denominator_unit: string
  separator?: string
}): string {
  let strength_display = `${strength_numerator}${strength_numerator_unit}${
    separator ?? '/'
  }`
  if (strength_denominator !== 1) {
    strength_display += strength_denominator
  }
  return strength_display + strength_denominator_unit
}

export function scheduleDisplay(
  schedule: MedicationSchedule,
  medication: MedicationDetails,
): string {
  const { frequency, dosage, duration, duration_unit } = schedule

  assertIntakeFrequency(frequency)
  const frequency_display = IntakeFrequencies[frequency]

  const dosage_display = dosageDisplay({
    dosage,
    ...medication,
  })

  return `${dosage_display} ${frequency_display} for ${duration} ${
    unpluralize(duration_unit, duration)
  }`
}

// // 2 tablets (50mg) per dose * 4 doses per day * 6 days = 48 tablets (50mg)
// export function describe(
//   medication: PrescriptionMedication,
// ): string {
//   assert(typeof medication.intake_frequency === 'string')
//   assertIntakeFrequency(medication.intake_frequency)

//   const dosesPerDay = IntakeDosesPerDay[medication.intake_frequency]

//   const singleDosage = dosageDisplay({
//     dosage: medication.dosage / medication.strength_denominator,
//     ...omit(medication, ['dosage']),
//   })

//   const totalDosage = dosageDisplay({
//     dosage: medication.dosage / medication.strength_denominator,
//     totalDosageMultiplier: duration * dosesPerDay,
//     ...omit(medication, ['dosage']),
//   })

//   return `*${medication.name}* : ${singleDosage} per dose * ${dosesPerDay} ${
//     pluralize('dose', dosesPerDay)
//   } per day * ${duration} ${pluralize('day', duration)} = ${totalDosage}`
//     .toLowerCase()
// }
