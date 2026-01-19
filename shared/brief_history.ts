import { assert } from 'std/assert/assert.ts'
import memoize from '../util/memoize.ts'
import {
  ARTHRITIS,
  ASTHMA,
  CHRONIC_OBSTRUCTIVE_PULMONARY_DISEASE,
  DIABETES_MELLITUS,
  DISEASE_CAUSED_BY_SEVERE_ACUTE_RESPIRATORY_SYNDROME_CORONAVIRUS_2,
  EPILEPSY,
  HEART_DISEASE,
  HUMAN_IMMUNODEFICIENCY_VIRUS_INFECTION,
  MALIGNANT_NEOPLASTIC_DISEASE,
  MENTAL_DISORDER,
  PREGNANCY,
  TUBERCULOSIS,
} from './snomed_concepts.ts'

export const COMMON_CONDITIONS = [
  {
    key: 'pregnancy' as const,
    label: 'Pregnancy',
    required: true,
    ...PREGNANCY,
  },
  {
    key: 'diabetes' as const,
    label: 'Diabetes',
    required: true,
    ...DIABETES_MELLITUS,
  },
  {
    key: 'tuberculosis' as const,
    label: 'Tuberculosis',
    required: false,
    ...TUBERCULOSIS,
  },
  {
    key: 'hiv' as const,
    label: 'Human Immunodeficiency Virus',
    required: false,
    ...HUMAN_IMMUNODEFICIENCY_VIRUS_INFECTION,
  },
  {
    key: 'asthma' as const,
    label: 'Asthma',
    required: false,
    ...ASTHMA,
  },
  {
    key: 'copd' as const,
    label: 'Chronic Obstructive Pulmonary Disease',
    required: false,
    ...CHRONIC_OBSTRUCTIVE_PULMONARY_DISEASE,
  },
  {
    key: 'covid19' as const,
    label: 'COVID-19',
    required: false,
    ...DISEASE_CAUSED_BY_SEVERE_ACUTE_RESPIRATORY_SYNDROME_CORONAVIRUS_2,
  },
  {
    key: 'heart_disease' as const,
    label: 'Heart Disease',
    required: false,
    ...HEART_DISEASE,
  },
  {
    key: 'mental_disorder' as const,
    label: 'Mental Disorder',
    required: false,
    ...MENTAL_DISORDER,
  },
  {
    key: 'epilepsy' as const,
    label: 'Epilepsy',
    required: false,
    ...EPILEPSY,
  },
  {
    key: 'arthritis' as const,
    label: 'Arthritis',
    required: false,
    ...ARTHRITIS,
  },
  {
    key: 'cancer' as const,
    label: 'Cancer',
    required: false,
    ...MALIGNANT_NEOPLASTIC_DISEASE,
  },
]

export type CommonCondition = typeof COMMON_CONDITIONS[number]

export type CommonConditionKey = (typeof COMMON_CONDITIONS)[number]['key']

export const COMMON_CONDITION_KEYS: CommonConditionKey[] = COMMON_CONDITIONS
  .map((c) => c.key)

export const commonConditionSnomedConcept = memoize(
  (key: CommonConditionKey) => {
    const condition = COMMON_CONDITIONS.find((c) => c.key === key)
    assert(condition)
    return condition
  },
)
