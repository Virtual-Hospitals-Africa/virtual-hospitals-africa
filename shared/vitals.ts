import {
  AgeDetermination,
  NonEmptyArray,
  VitalAssessmentFormInputDefition,
  VitalMeasurementFormInputDefition,
} from '../types.ts'
import compact from '../util/compact.ts'
import entries from '../util/entries.ts'
import findMatching from '../util/findMatching.ts'
import keys from '../util/keys.ts'
import memoize from '../util/memoize.ts'

export const TAKING_PATIENT_VITAL_SIGNS_SNOMED_CONCEPT_ID = '61746007'

export const SEVERITY_SCORE_SNOMED_CONCEPT_ID = '278305009' // |Severity score (qualifier value)|

export const VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS = {
  height: '1153637007',
  weight: '363808001',
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

export const VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS = {
  mobility_assessment: '301438001',
  consciousness: '1104441000000107',
  trauma_presence: '417746004',
}

export const ALL_VITALS_SNOMED_CONCEPT_IDS = {
  ...VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
  ...VITALS_COMPUTED_SNOMED_CONCEPT_IDS,
  ...VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS,
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
      `No vital found for snomed_concept_id: ${snomed_concept_id}`,
    )
  },
)

export const vitalFromSnomedConceptId = memoize(
  (snomed_concept_id: string) => {
    for (
      const [vital, concept_id] of entries(
        ALL_VITALS_SNOMED_CONCEPT_IDS,
      )
    ) {
      if (concept_id === snomed_concept_id) {
        return vital
      }
    }
    throw new Error(
      `No vital found for snomed_concept_id: ${snomed_concept_id}`,
    )
  },
)

export const ALL_VITAL_SNOMED_CONCEPT_IDS = Object.values({
  ...VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
  ...VITALS_COMPUTED_SNOMED_CONCEPT_IDS,
  ...VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS,
})

export type ComputedVital = keyof typeof VITALS_COMPUTED_SNOMED_CONCEPT_IDS
export type VitalMeasurement =
  keyof typeof VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS
export type VitalAssessment = keyof typeof VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS
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

export const vitalAssessmentFromSnomedConceptId = memoize(
  (snomed_concept_id: string) => {
    for (
      const [vital, concept_id] of entries(VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS)
    ) {
      if (concept_id === snomed_concept_id) {
        return vital
      }
    }
    throw new Error(
      `No vital found for snomed_concept_id: ${snomed_concept_id}`,
    )
  },
)

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

// deno-fmt-ignore
const ASESSMENT_OPTIONS: {
  [a in VitalAssessment]: {
    label: string
    score: TEWSScore
    snomed_concept_id: string
    available_to_ages: NonEmptyArray<AgeDetermination>
  }[]
} = {
  consciousness: [
    { label: 'Alert' as const, score: 0, snomed_concept_id: '248234008', available_to_ages: ['adult', 'older child', 'younger child'] },
    { label: 'Reacts to voice' as const, score: 1, snomed_concept_id: '422768004', available_to_ages: ['adult', 'older child', 'younger child'] },
    { label: 'Confused' as const, score: 2, snomed_concept_id: '40917007', available_to_ages: ['adult', 'older child'] },
    { label: 'Reacts to pain' as const, score: 2, snomed_concept_id: '450847001', available_to_ages: ['adult', 'older child', 'younger child'] },
    { label: 'Unresponsive' as const, score: 3, snomed_concept_id: '422107003', available_to_ages: ['adult', 'older child', 'younger child'] },
  ],
  mobility_assessment: [
    { label: 'Walking' as const, score: 0, snomed_concept_id: '282144007', available_to_ages: ['adult'] },
    { label: 'Difficulty walking' as const, score: 1, snomed_concept_id: '719232003', available_to_ages: ['adult'] },
    { label: 'Stretcher/Immobile' as const, score: 2, snomed_concept_id: '282145008', available_to_ages: ['adult'] },
    // TODO: get correct snomed_concept_id for these younger child
    { label: 'Normal for age' as const, score: 0, snomed_concept_id: '1149217004', available_to_ages: ['older child', 'younger child'] },
    { label: 'Unable to move as normal' as const, score: 2, snomed_concept_id: '1149217004', available_to_ages: ['younger child'] },
    { label: 'Unable to walk as normal' as const, score: 2, snomed_concept_id: '1149217004', available_to_ages: ['older child'] },
  ],
  trauma_presence: [
    { label: 'No' as const, score: 0, snomed_concept_id: '1149217004', available_to_ages: ['adult', 'older child', 'younger child'] },
    { label: 'Yes' as const, score: 1, snomed_concept_id: '417746004', available_to_ages: ['adult', 'older child', 'younger child'] },
  ],
}
// deno-fmt-ignore-end

export function assessmentOptionSnomedConceptId(
  vital: VitalAssessment,
  label: string
) {
  return findMatching(ASESSMENT_OPTIONS[vital], { label }).snomed_concept_id
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
    blood_pressure_systolic: [
      { max: 71, score: 3 },
      { max: 81, score: 2 },
      { max: 101, score: 1 },
      { max: 200, score: 0 },
      { max: Infinity, score: 2 },
    ],
    temperature: [
      { max: 35, score: 2 },
      { max: 38.5, score: 0 },
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

export function getScoreForMeasurement(
  age_determination: AgeDetermination,
  vital: VitalMeasurement,
  value: number,
): TEWSScore | null {
  const ranges = MEASUREMENT_RANGES[age_determination][vital]
  if (!ranges) return null
  for (const range of ranges) {
    if (value < range.max) {
      return range.score
    }
  }
  return null
}

export function getScoreForAssessment(
  age_determination: AgeDetermination,
  vital: VitalAssessment,
  value_snomed_concept_id: string,
): TEWSScore | null {
  const options = ASESSMENT_OPTIONS[vital]
  const option = options.find(
    (o) =>
      o.snomed_concept_id === value_snomed_concept_id &&
      o.available_to_ages.includes(age_determination),
  )
  return option?.score ?? null
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
    snomed_concept_id: VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS[vital],
    options: options.filter((option) =>
      option.available_to_ages.includes(age_determination)
    ),
  }))

  return { measurements, assessments }
}
