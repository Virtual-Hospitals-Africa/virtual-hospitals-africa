import {
  AgeDetermination,
  NonEmptyArray,
  Priority,
  RecordValue,
  RecordValueMeasurement,
  ReferenceRangeX,
  RenderedFindingRelativeToHealthWorker,
  Values,
  VitalAssessmentFormInputDefition,
  VitalMeasurementFormInputDefition,
} from '../types.ts'
import { Decimal } from '../util/decimal.ts'
import compact from '../util/compact.ts'
import entries from '../util/entries.ts'
import { exists } from '../util/exists.ts'
import findMatching from '../util/findMatching.ts'
import isKeyOf from '../util/isKeyOf.ts'
import keys from '../util/keys.ts'
import memoize from '../util/memoize.ts'
import { PRIORITY_COLORS, TriageLevel } from './priorities.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { arrayIsEmpty, assertArrayNonEmpty } from '../util/arraySize.ts'
import last from '../util/last.ts'
import { assert } from 'std/assert/assert.ts'
import { positive_decimal } from '../util/validators.ts'
import { collectSortedUniqDecimals } from '../util/collectSorted.ts'

import { normalForm } from './s_expression.ts'
import { Lang } from './s_expression_schemas.ts'
import { inverseSExpression } from './s_expression_inverse.ts'
import { humanReadableJson } from '../util/humanReadableJson.ts'
import assertOneOf from '../util/assertOneOf.ts'
import mapEntries from '../util/mapEntries.ts'

export const VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS = {
  height: '1153637007',
  weight: '27113001',
  temperature: '386725007',
  blood_pressure_systolic: '271649006',
  blood_pressure_diastolic: '271650006',
  blood_oxygen_saturation: '103228002',
  blood_glucose: '405176005',
  heart_rate: '8499008',
  respiratory_rate: '86290005',
  midarm_circumference: '284473002',
  triceps_skinfold: '301851003',
  head_circumference: '363812007',
}

export const VITALS_COMPUTED_SNOMED_CONCEPT_IDS = {
  body_mass_index: '698094009',
  mean_arterial_pressure: '6797001',
  blood_pressure: '75367002',
}

export const VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPT_IDS = {
  mobility_assessment: '430481008', // |Assessment of mobility (procedure)|
  consciousness: '1104441000000107', // |Alert Confusion Voice Pain Unresponsive scale score (observable entity)|
  trauma_presence: '273884004', // |Trauma score (assessment scale)|',
}

export const vitalMeasurementFromSnomedConceptId = memoize(
  (snomed_concept_id: string) => {
    for (
      const [vital, concept_id] of entries(
        VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
      )
    ) {
      if (concept_id === snomed_concept_id) {
        return vital
      }
    }
    throw new Error(
      `No vital measurement found for snomed_concept_id: ${snomed_concept_id}`,
    )
  },
)

export function vitalAssessmentOrder(
  f: RenderedFindingRelativeToHealthWorker,
): number {
  for (
    const [i, [_vital, evaluation_snomed_concept_id]] of entries(
      VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPT_IDS,
    ).entries()
  ) {
    if (isAssessmentFor(f, evaluation_snomed_concept_id)) {
      return i
    }
  }

  throw new Error(`Finding not an assessment \n${humanReadableJson(f)}`)
}

export type ComputedVital = keyof typeof VITALS_COMPUTED_SNOMED_CONCEPT_IDS
export type VitalMeasurement = keyof typeof VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS
export type VitalAssessment = keyof typeof VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPT_IDS
export type Vital = VitalMeasurement | VitalAssessment

export const ADULT_TEWS_COMPONENTS = [
  'mobility_assessment' as const,
  'respiratory_rate' as const,
  'heart_rate' as const,
  'blood_pressure_systolic' as const,
  'temperature' as const,
  'consciousness' as const,
  'trauma_presence' as const,
] satisfies Vital[]

export type AdultTEWSComponent = (typeof ADULT_TEWS_COMPONENTS)[number]

export const VITAL_MEASUREMENTS_UNITS = {
  height: 'cm',
  weight: 'kg',
  temperature: '°C',
  blood_pressure_systolic: 'mmHg',
  blood_pressure_diastolic: 'mmHg',
  blood_oxygen_saturation: '%',
  blood_glucose: 'mg/dL',
  heart_rate: 'bpm',
  respiratory_rate: 'bpm',
  midarm_circumference: 'cm',
  head_circumference: 'cm',
  triceps_skinfold: 'cm',
} satisfies {
  [v in VitalMeasurement]: string
}

// // Computed vitals
export const VITAL_COMPUTED_UNITS = {
  body_mass_index: 'kg/m²',
  mean_arterial_pressure: 'mmHg',
  blood_pressure: 'mmHg',
} satisfies {
  [v in ComputedVital]: string
}

/**
 * Extracts active condition SNOMED codes from patient history context.
 *
 * TODO: When patient_history.pre_existing_conditions schema is properly implemented
 * with condition objects containing snomed_concept_id fields, update this function
 */
export function getActiveConditionsSnomedCodesFromContext(
  patient_history: { pre_existing_conditions: readonly unknown[] },
): readonly string[] {
  return patient_history.pre_existing_conditions as readonly string[]
}

export const CM_TO_METERS = 100
export const BMI_DECIMAL_PLACES = 1

export function computeBMI(height_cm: number, weight_kg: number): number {
  if (height_cm <= 0 || weight_kg <= 0) {
    return 0
  }
  const height_m = height_cm / CM_TO_METERS
  return weight_kg / (height_m * height_m)
}

export function computeMeanArterialPressure(
  systolic: number,
  diastolic: number,
): number {
  return diastolic + (systolic - diastolic) / 3
}

export function formatBloodPressureDisplay(
  systolic: number,
  diastolic: number,
): string {
  return `${systolic}/${diastolic}`
}

type TEWSScore = 0 | 1 | 2 | 3

function asSExpression(specific_snomed_concept_id: string) {
  return normalForm(`(clinical_finding ${specific_snomed_concept_id})`)
}

const normal_for_age = normalForm(`
  (clinical_finding
    (snomed_concept "Ability to move" "observable entity")
    (snomed_concept "Normal" "qualifier value")
    (qualifier (snomed_concept "For" "qualifier value")
      (qualifier (snomed_concept "Age" "qualifier value"))))
`)

const abnormal_for_age = normalForm(`
  (clinical_finding
    (snomed_concept "Ability to move" "observable entity")
    (snomed_concept "Abnormal" "qualifier value")
    (qualifier (snomed_concept "For" "qualifier value")
      (qualifier (snomed_concept "Age" "qualifier value"))))
`)

// deno-fmt-ignore
const ASESSMENT_OPTIONS: {
  [a in VitalAssessment]: {
    label: string
    score: TEWSScore
    s_expression: string
    available_to_ages: NonEmptyArray<AgeDetermination>
  }[]
} = {
  mobility_assessment: [
    { label: 'Walking' as const, score: 0, s_expression: asSExpression('282144007'), available_to_ages: ['adult'] },
    { label: 'Difficulty walking' as const, score: 1, s_expression: asSExpression('719232003'), available_to_ages: ['adult'] },
    { label: 'Stretcher/Immobile' as const, score: 2, s_expression: asSExpression('282145008'), available_to_ages: ['adult'] },
    // TODO: get correct s_expression fasSExpression(or )these younger child
    { label: 'Normal for age' as const, score: 0, s_expression: normal_for_age, available_to_ages: ['older child', 'younger child'] },
    { label: 'Unable to move as normal' as const, score: 2, s_expression: abnormal_for_age, available_to_ages: ['younger child'] },
    { label: 'Unable to walk as normal' as const, score: 2, s_expression: abnormal_for_age, available_to_ages: ['older child'] },
  ],
  consciousness: [
    { label: 'Alert' as const, score: 0, s_expression: asSExpression('248234008'), available_to_ages: ['adult', 'older child', 'younger child'] },
    { label: 'Reacts to voice' as const, score: 1, s_expression: asSExpression('422768004'), available_to_ages: ['adult', 'older child', 'younger child'] },
    { label: 'Confused' as const, score: 2, s_expression: asSExpression('40917007'), available_to_ages: ['adult', 'older child'] },
    { label: 'Reacts to pain' as const, score: 2, s_expression: asSExpression('450847001'), available_to_ages: ['adult', 'older child', 'younger child'] },
    { label: 'Unresponsive' as const, score: 3, s_expression: asSExpression('422107003'), available_to_ages: ['adult', 'older child', 'younger child'] },
  ],
  trauma_presence: [
    { label: 'No' as const, score: 0, s_expression: asSExpression('1149217004'), available_to_ages: ['adult', 'older child', 'younger child'] },
    { label: 'Yes' as const, score: 1, s_expression: asSExpression('417746004'), available_to_ages: ['adult', 'older child', 'younger child'] },
  ],
}
// deno-fmt-ignore-end

export const ASESSMENTS_ORDERED = keys(ASESSMENT_OPTIONS)

export function assessmentOptionSExpression(
  vital: VitalAssessment,
  label: string,
) {
  return findMatching(ASESSMENT_OPTIONS[vital], { label }).s_expression
}

// deno-fmt-ignore
const MEASUREMENT_RANGES: {
  [a in AgeDetermination]: {
    [v in VitalMeasurement]?: {
      max: number
      score: TEWSScore
    }[]
  }
} = {
  adult: {
    respiratory_rate: [
      { max: 9, score: 3 },
      { max: 15, score: 0 },
      { max: 21, score: 1 },
      { max: 30, score: 2 },
      { max: Infinity, score: 3 },
    ],
    heart_rate: [
      { max: 41, score: 3 },
      { max: 51, score: 1 },
      { max: 101, score: 0 },
      { max: 111, score: 1 },
      { max: 130, score: 2 },
      { max: Infinity, score: 3 },
    ],
    temperature: [
      { max: 35, score: 2 },
      { max: 38.5, score: 0 },
      { max: Infinity, score: 2 },
    ],
    blood_pressure_systolic: [
      { max: 71, score: 3 },
      { max: 81, score: 2 },
      { max: 101, score: 1 },
      { max: 200, score: 0 },
      { max: Infinity, score: 2 },
    ],
  },
  'older child': {
    respiratory_rate: [
      { max: 15, score: 3 },
      { max: 17, score: 2 },
      { max: 22, score: 0 },
      { max: 27, score: 1 },
      { max: Infinity, score: 2 },
    ],
    heart_rate: [
      { max: 60, score: 3 },
      { max: 80, score: 2 },
      { max: 100, score: 0 },
      { max: 130, score: 1 },
      { max: Infinity, score: 2 },
    ],
    temperature: [
      { max: 35, score: 2 },
      { max: 38.5, score: 0 },
      { max: Infinity, score: 2 },
    ],
  },
  'younger child': {
    respiratory_rate: [
      { max: 20, score: 3 },
      { max: 26, score: 2 },
      { max: 40, score: 0 },
      { max: 50, score: 2 },
      { max: Infinity, score: 3 },
    ],
    heart_rate: [
      { max: 70, score: 3 },
      { max: 80, score: 2 },
      { max: 131, score: 0 },
      { max: 160, score: 2 },
      { max: Infinity, score: 3 },
    ],
    temperature: [
      { max: 35, score: 2 },
      { max: 38.5, score: 0 },
      { max: Infinity, score: 2 },
    ],
  },
}

export const MEASUREMENTS_ORDERED = keys(MEASUREMENT_RANGES.adult)

export function getScoreForMeasurement(
  age_determination: AgeDetermination,
  vital: VitalMeasurement,
  value: Decimal,
): TEWSScore | null {
  const ranges = MEASUREMENT_RANGES[age_determination][vital]
  if (!ranges) return null
  for (const range of ranges) {
    if (range.max === Infinity || value.lessThan(range.max)) {
      return range.score
    }
  }
  throw new Error(
    `Given ranges exist for ${vital}, we have to have a max. value: ${value}`,
  )
}

export function getScoreForAssessment(
  age_determination: AgeDetermination,
  vital: VitalAssessment,
  finding: Lang['finding'],
): TEWSScore {
  const options = ASESSMENT_OPTIONS[vital]
  const option = options.find(
    (o) =>
      o.s_expression === inverseSExpression(finding) &&
      o.available_to_ages.includes(age_determination),
  )
  return exists(option).score
}

export function measureVitalsInputDefinitions(
  { age_determination, has_diabetes }: {
    age_determination: AgeDetermination
    has_diabetes: boolean
  },
): {
  measurements: VitalMeasurementFormInputDefition[]
  assessments: VitalAssessmentFormInputDefition[]
} {
  const measurement_vitals = keys(MEASUREMENT_RANGES[age_determination])

  // While there's no reference range for diastolic, these are taken together
  if (measurement_vitals.includes('blood_pressure_systolic')) {
    measurement_vitals.push('blood_pressure_diastolic')
  }

  if (has_diabetes) {
    measurement_vitals.push('blood_glucose')
  }

  const measurements: VitalMeasurementFormInputDefition[] = compact(
    // iterate over measurements for the sort order
    keys(VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS)
      .map((vital) => (measurement_vitals.includes(vital) && {
        vital,
        required: true,
        units: VITAL_MEASUREMENTS_UNITS[vital],
        snomed_concept_id: VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS[vital],
      })),
  )

  const assessments: VitalAssessmentFormInputDefition[] = entries(
    ASESSMENT_OPTIONS,
  ).map(([vital, options]) => ({
    vital,
    required: true,
    evaluation_snomed_concept_id: VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPT_IDS[vital],
    options: options.filter((option) => option.available_to_ages.includes(age_determination)),
  }))

  return { measurements, assessments }
}

export function triageLevelFromTEWSTotal(
  total_score: number,
  age_determination: AgeDetermination,
): TriageLevel {
  if (total_score > 14) {
    assertEquals(age_determination, 'adult', 'The max score for children is 14')
  }
  switch (total_score) {
    case 0:
    case 1:
    case 2:
      return 'Non-urgent'
    case 3:
    case 4:
      return 'Urgent'
    case 5:
    case 6:
      return 'Very urgent'
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      return 'Emergency'
    case 13:
    case 14:
      assertOneOf(
        age_determination,
        ['adult', 'younger child'],
        'The max score for an older child is 12',
      )
      return 'Emergency'
    case 15:
    case 16:
      assertEquals(
        age_determination,
        'adult',
        'The max score for children is 14',
      )
      return 'Emergency'
    default:
      throw new Error(`Unexpected total TEWS score ${total_score}`)
  }
}

export function colorFromScoreComponent(
  score: number,
): ReferenceRangeX['color'] {
  switch (score) {
    case 0:
      return 'green'
    case 1:
      return 'yellow'
    case 2:
      return 'orange'
    case 3:
      return 'red'
    default:
      throw new Error(`Unexpected TEWS score component ${score}`)
  }
}

export function colorFromPriorityOrScoreComponent(
  score: number | null,
  priority: Priority | null,
): Values<typeof PRIORITY_COLORS> {
  if (priority != null) {
    return PRIORITY_COLORS[priority]
  }
  assert(score != null, 'Must call with score or priority not null')
  switch (score) {
    case 0:
      return PRIORITY_COLORS['Non-urgent']
    case 1:
      return PRIORITY_COLORS['Urgent']
    case 2:
      return PRIORITY_COLORS['Very urgent']
    case 3:
      return PRIORITY_COLORS['Emergency']
    default:
      throw new Error(`Unexpected TEWS score component ${score}`)
  }
}

export function buildReferenceRanges(
  snomed_concept_id: string,
  age_determination: AgeDetermination,
  values_to_be_sure_to_include: string[],
): ReferenceRangeX[] | null {
  if (arrayIsEmpty(values_to_be_sure_to_include)) {
    return null
  }

  const vital = vitalMeasurementFromSnomedConceptId(snomed_concept_id)
  if (!isKeyOf(vital, VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS)) {
    return null
  }

  const decimal_values = collectSortedUniqDecimals(
    values_to_be_sure_to_include.map((v) => positive_decimal.parse(v)),
  )

  const ranges = MEASUREMENT_RANGES[age_determination][vital]
  if (!ranges) return null

  assertArrayNonEmpty(ranges)
  assert(ranges.length >= 3)
  assertEquals(last(ranges).max, Infinity)

  const min_value_to_be_sure_to_include = decimal_values[0]
  const max_value_to_be_sure_to_include = exists(last(decimal_values))

  // For the lowest fixed range, find the interval
  const interval_low = ranges[1].max - ranges[0].max
  // For the half-open low range, by default choose an interval that is 1/3 the length of the lowest fixed range
  const half_open_low_base_interval = interval_low / 3
  // By default, close the half open range on the low end
  const low_range_base = ranges[0].max - half_open_low_base_interval

  // Do the same on the high end
  const interval_high = ranges.at(-2)!.max - ranges.at(-3)!.max
  const half_open_high_base_interval = interval_high / 3
  const high_range_base = ranges.at(-2)!.max + half_open_high_base_interval

  // The base ranges above may not include the values
  // At the lowest, the values to be sure to include will appear visually at a minimum of 4% from the left/right
  const padding_factor = 0.04

  const min_value_supporting_padding_factor = (min_value_to_be_sure_to_include.toNumber() - padding_factor * high_range_base) / (1 - padding_factor)
  const max_value_supporting_padding_factor = (-max_value_to_be_sure_to_include.toNumber() + padding_factor * low_range_base) / (padding_factor - 1)

  const low_range_min = Math.min(
    low_range_base,
    min_value_supporting_padding_factor,
  )

  const high_range_max = Math.max(
    high_range_base,
    max_value_supporting_padding_factor,
  )

  if (vital === 'temperature') {
    assertEquals(interval_low, interval_high)
  }

  return ranges.map((range, i) => ({
    low: i ? ranges[i - 1].max : low_range_min,
    high: range.max === Infinity ? high_range_max : range.max,
    color: colorFromScoreComponent(range.score),
  }))

  /*
    Giving flavor of the above
    {
      vital: "heart_rate",
      decimal_values: [ Decimal(80) ],
      ranges: [
        { max: 41, score: 3 },
        { max: 51, score: 1 },
        { max: 101, score: 0 },
        { max: 111, score: 1 },
        { max: 130, score: 2 },
        { max: Infinity, score: 3 }
      ],
      min_value_to_be_sure_to_include: Decimal(80),
      max_value_to_be_sure_to_include: Decimal(80),
      interval_low: 10,
      low_range_base: 37.666666666666664,
      interval_high: 19,
      high_range_base: 136.33333333333334,
      padding_factor: 0.04,
      total_interval_base: 98.66666666666669,
      min_value_supporting_padding_factor: 77.65277777777779,
      max_value_supporting_padding_factor: 81.7638888888889,
      low_range_min: 37.666666666666664,
      high_range_max: 136.33333333333334
    }
    {
      vital: "temperature",
      decimal_values: [ Decimal(36.75) ],
      ranges: [
        { max: 35, score: 2 },
        { max: 38.5, score: 0 },
        { max: Infinity, score: 2 }
      ],
      min_value_to_be_sure_to_include: Decimal(36.75),
      max_value_to_be_sure_to_include: Decimal(36.75),
      interval_low: 3.5,
      low_range_base: 33.833333333333336,
      interval_high: 3.5,
      high_range_base: 39.666666666666664,
      padding_factor: 0.04,
      total_interval_base: 5.833333333333329,
      min_value_supporting_padding_factor: 36.62847222222222,
      max_value_supporting_padding_factor: 36.87152777777778,
      low_range_min: 33.833333333333336,
      high_range_max: 39.666666666666664
    }
  */
}

export function isMeasurement<
  R extends {
    value: null | RecordValue
  },
>(
  record: R,
): record is R & { value: RecordValueMeasurement } {
  return !!record.value && record.value.type === 'measurement'
}

export function isAssessmentFor(
  f: RenderedFindingRelativeToHealthWorker,
  evaluation_snomed_concept_id: string,
): boolean {
  const has_matching_evaluation = f.evaluations.some((e) => e.specific_snomed_concept.snomed_concept_id === evaluation_snomed_concept_id)
  if (!has_matching_evaluation) return false

  // const specific_snomed_concept_id = f.specific_snomed_concept.snomed_concept_id
  // const vital = vitalAssessmentFromSnomedConceptId(evaluation_snomed_concept_id)

  // const options = ASESSMENT_OPTIONS[vital]
  // const finding_matches = options.some((option) =>
  //   option.specific_snomed_concept_id === specific_snomed_concept_id
  // )
  // assert(
  //   finding_matches,
  //   `The evaluation was for ${vital}, but the finding ${specific_snomed_concept_id} was not a recognized option`,
  // )
  return true
}

export function matchingAssessment(
  f: RenderedFindingRelativeToHealthWorker,
): null | {
  vital: keyof typeof VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPT_IDS
  evaluation_snomed_concept_id: string
  specific_snomed_concept_id: string
} {
  for (
    const [vital, evaluation_snomed_concept_id] of entries(
      VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPT_IDS,
    )
  ) {
    for (const evaluation of f.evaluations) {
      if (
        evaluation.root_snomed_concept.snomed_concept_id ===
          evaluation_snomed_concept_id
      ) {
        const specific_snomed_concept_id = f.specific_snomed_concept.snomed_concept_id
        return {
          vital,
          evaluation_snomed_concept_id,
          specific_snomed_concept_id,
        }
      }
    }
  }

  return null
}

export function asVitalMeasurementFormValues(
  measurement_values: Partial<Record<VitalMeasurement, number>>,
) {
  return mapEntries(measurement_values, (value, vital) => ({
    value,
    units: VITAL_MEASUREMENTS_UNITS[vital],
  }))
}

export function asVitalAssessmentFormValues(
  assessment_values: { [v in VitalAssessment]: string },
) {
  return mapEntries(assessment_values, (value, vital) => ({
    s_expression: assessmentOptionSExpression(
      vital,
      value,
    ),
  }))
}
