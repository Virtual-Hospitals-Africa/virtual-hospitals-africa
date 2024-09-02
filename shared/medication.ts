import { assert } from 'std/assert/assert.ts'
import memoize from '../util/memoize.ts'
import isNumber from '../util/isNumber.ts'

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

export function assertIntakeFrequency(
  frequency: string,
): asserts frequency is IntakeFrequency {
  assert(frequency in IntakeFrequencies)
}

export const IntakeDosesPerDay = {
  ac: 3, // 3 doses per day
  am: 1, // 1 doses per day
  bd: 2, // 2 doses per day
  nocte: 1, // 1 doses per day
  od: 1, // 1 doses per day
  pm: 1, // 1 doses per day
  q15: 96, // 96 doses per day
  q30: 48, // 48 doses per day
  q1h: 24, // 24 doses per day
  q2h: 12, // 12 doses per day
  q4h: 6, // 6 doses per day
  q6h: 4, // 4 doses per day
  q8h: 3, // 3 doses per day
  qd: 1, // 1 doses per day
  qid: 4, // 4 doses per day
  qod: 0.5, // 0.5 doses per day
  qs: 1, // 1 doses per day
  mane: 1, // 1 doses per day
  qmane: 1, // 1 doses per day
  qn: 1, // 1 doses per day
  stat: 1, // 1 doses per day
  tds: 3, // 3 doses per day
  q24h: 1, // 1 dose per day
  q30h: 0.8, // 0.8 dose per day
  q48h: 0.5, // 0.5 dose per day
  q72h: 1 / 3, // 1/3 dose per day
  hs: 1, // 1 doses per day
  qhs: 1, // 1 doses per day
  qw: 1 / 7, // 1/7 doses per day
  bw: 2 / 7, // 2/7 doses per day
  tw: 3 / 7, // 3/7 doses per day
  qm: 1 / 30, // 1/30 doses per day
  bm: 2 / 30, // 2/30 doses per day
  tm: 3 / 30, // 3/30 doses per day
  prn: 1, // 1 dose per day
} satisfies {
  [frequency in IntakeFrequency]: number
}

type DosageDisplayParams = {
  dosage_text?: string
  dosage: number
  totalDosageMultiplier?: number
  strength: number | string
  strength_denominator: number | string
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
    strength,
    strength_denominator,
    strength_numerator_unit,
    strength_denominator_unit,
    strength_denominator_is_units,
    dosage_text,
    dosage,
    totalDosageMultiplier,
  } = params
  const numeric_strength = isNumber(strength) ? strength : parseFloat(strength)
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
