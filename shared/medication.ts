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

type DosageDisplayParams = {
  dosage_text?: string
  dosage: number
  strength: number | string
  strength_denominator: number | string
  strength_denominator_unit: string
  strength_denominator_is_units: boolean
  strength_numerator_unit: string
}

const denominatorPlural = memoize(
  (
    { strength_denominator_unit, strength_denominator_is_units }:
      DosageDisplayParams,
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
  } = params
  const numeric_strength = isNumber(strength) ? strength : parseFloat(strength)
  assert(numeric_strength)
  const numeric_strength_denominator = isNumber(strength_denominator)
    ? strength_denominator
    : parseFloat(strength_denominator)
  assert(numeric_strength_denominator)
  const single_dose = dosage * numeric_strength_denominator
  let display = strength_denominator === 1
    ? (dosage_text || dosageText(dosage))
    : String(single_dose)

  if (!strength_denominator_is_units) {
    display += ' '
  }
  display += dosage > 1 ? denominatorPlural(params) : strength_denominator_unit
  display += ` (${numeric_strength * dosage}${strength_numerator_unit})`

  return display
}
