import { assert } from 'std/assert/assert.ts'
import memoize from '../util/memoize.ts'
import { Decimal } from '../util/decimal.ts'

export const DOSAGES: [string, string][] = [
  ['¼', '0.25'],
  ['½', '0.5'],
  ['1', '1'],
  ['2', '2'],
  ['3', '3'],
  ['4', '4'],
  ['5', '5'],
  ['6', '6'],
  ['7', '7'],
  ['8', '8'],
  ['9', '9'],
  ['10', '10'],
]

function dosageText(dosage: string): string {
  const matching = DOSAGES.find(([, value]) => value === dosage)
  assert(matching)
  return matching[0]
}

export const PrescriptionFrequencies = {
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
  mane: 'morning',
  qmane: 'every morning',
  qn: 'every night',
  tds: '3 times a day',
  q24h: 'every 24 hours',
  q30h: 'every 30 hours',
  q48h: 'every 48 hours',
  q72h: 'every 72 hours',
  hs: 'at bedtime',
  qhs: 'daily at bedtime',
  qw: 'once a week',
  bw: 'twice a week',
  tw: 'three times a week',
  qm: 'once a month',
  bm: 'twice a month',
  tm: 'three times a month',
  qs: 'sufficient enough quantity',
  stat: 'immediately, now',
  prn: 'when necessary',
}

export function prescriptionFrequencyText(frequency: string): string {
  assertPrescriptionFrequency(frequency)
  return PrescriptionFrequencies[frequency]
}

export type PrescriptionFrequency = keyof typeof PrescriptionFrequencies

export function isPrescriptionFrequency(
  frequency: string,
): frequency is PrescriptionFrequency {
  return frequency in PrescriptionFrequencies
}

export function assertPrescriptionFrequency(
  frequency: string,
): asserts frequency is PrescriptionFrequency {
  assert(isPrescriptionFrequency(frequency))
}

export const MEDICATION_DOSES_PER_DAY = {
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
  mane: 1,
  qmane: 1,
  qn: 1,
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
} satisfies {
  [frequency in PrescriptionFrequency]?: number
}

export type PrescriptionFrequencyFixed = keyof typeof MEDICATION_DOSES_PER_DAY

export type PrescriptionFrequencyFluid = Exclude<PrescriptionFrequency, PrescriptionFrequencyFixed>

type DosageDisplayParams = {
  dosage_text?: string
  dosage: string
  strength_numerator: string
  strength_denominator: string
  strength_denominator_unit: string
  description_is_units: boolean
  strength_numerator_unit: string
}

export const denominatorPlural = memoize(
  (
    { strength_denominator_unit, description_is_units }: {
      strength_denominator_unit: string
      description_is_units: boolean
    },
  ) => {
    assert(strength_denominator_unit)
    if (description_is_units) return strength_denominator_unit
    if (strength_denominator_unit === 'SUPPOSITORY') return 'SUPPOSITORIES'
    return strength_denominator_unit + 'S'
  },
)

export function dosageDisplay(params: DosageDisplayParams) {
  const {
    strength_numerator_unit,
    strength_denominator_unit,
    description_is_units,
    dosage_text,
  } = params
  const strength_numerator = new Decimal(params.strength_numerator)
  const strength_denominator = new Decimal(params.strength_denominator)
  const dosage = new Decimal(params.dosage)

  const single_dose = strength_denominator.mul(dosage)

  let display = strength_denominator.equals(1) ? (dosage_text ?? dosageText(params.dosage)) : String(single_dose)

  if (!description_is_units) {
    display += ' '
  }
  display += dosage.equals(1) ? strength_denominator_unit : denominatorPlural(params)
  display += ` (${strength_numerator.mul(dosage)}${strength_numerator_unit})`

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
  strength_numerator: string
  strength_numerator_unit: string
  strength_denominator: string
  strength_denominator_unit: string
  separator?: string
}): string {
  let strength_display = `${strength_numerator}${strength_numerator_unit}${separator ?? '/'}`
  if (strength_denominator === '1') {
    strength_display += strength_denominator
  }
  return strength_display + strength_denominator_unit
}

// TODO: rewrite to work with new RenderedMedication type (doses array instead of flat strength fields)
// export function scheduleDisplay(
//   schedule: MedicationSchedule,
//   medication: RenderedMedication,
// ): string {
//   const { frequency, dosage, duration, duration_unit } = schedule
//
//   assertPrescriptionFrequency(frequency)
//   const frequency_display = PrescriptionFrequencies[frequency]
//
//   const dosage_display = dosageDisplay({
//     dosage,
//     ...medication,
//   })
//
//   return `${dosage_display} ${frequency_display} for ${duration} ${unpluralize(duration_unit, duration)}`
// }

// // // 2 tablets (50mg) per dose * 4 doses per day * 6 days = 48 tablets (50mg)
// export function describe(
//   medication: PrescriptionMedication,
// ): string {
//   assert(typeof medication.medication_frequency === 'string')
//   assertPrescriptionFrequency(medication.medication_frequency)

//   const doses_per_day = medication_doses_per_day[medication.medication_frequency]

//   const single_dosage = dosageDisplay({
//     dosage: medication.dosage / medication.strength_denominator,
//     ...omit(medication, ['dosage']),
//   })

//   const total_dosage =dosageDisplay({
//     dosage: medication.dosage / medication.strength_denominator,
//     total_dosage_multiplier: duration * doses_per_day,
//     ...omit(medication, ['dosage']),
//   })

//   return `*${medication.name}* : ${single_dosage} per dose * ${doses_per_day} ${
//     pluralize('dose', doses_per_day)
//   } per day * ${duration} ${pluralize('day', duration)} = ${total_dosage}`
//     .toLowerCase()
// }
