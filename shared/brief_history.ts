import { assert } from 'std/assert/assert.ts'
import memoize from '../util/memoize.ts'

export const COMMON_CONDITIONS = [
  {
    key: 'pregnancy' as const,
    label: 'Pregnancy',
    snomed_concept_id: '77386006',
    required: true,
  },
  {
    key: 'diabetes' as const,
    label: 'Diabetes',
    snomed_concept_id: '73211009',
    required: true,
  },
  {
    key: 'tuberculosis' as const,
    label: 'Tuberculosis',
    snomed_concept_id: '56717001',
    required: false,
  },
  {
    key: 'hiv' as const,
    label: 'Human Immunodeficiency Virus',
    snomed_concept_id: '86406008',
    required: false,
  },
  {
    key: 'asthma' as const,
    label: 'Asthma',
    snomed_concept_id: '195967001',
    required: false,
  },
  {
    key: 'copd' as const,
    label: 'Chronic Obstructive Pulmonary Disease',
    snomed_concept_id: '13645005',
    required: false,
  },
  {
    key: 'coronavirus' as const,
    label: 'Coronavirus',
    snomed_concept_id: '186747009',
    required: false,
  },
  {
    key: 'heart_disease' as const,
    label: 'Heart Disease',
    snomed_concept_id: '56265001',
    required: false,
  },
  {
    key: 'mental_disorder' as const,
    label: 'Mental Disorder',
    snomed_concept_id: '74732009',
    required: false,
  },
  {
    key: 'epilepsy' as const,
    label: 'Epilepsy',
    snomed_concept_id: '84757009',
    required: false,
  },
  {
    key: 'arthritis' as const,
    label: 'Arthritis',
    snomed_concept_id: '3723001',
    required: false,
  },
  {
    key: 'cancer' as const,
    label: 'Cancer',
    snomed_concept_id: '363346000',
    required: false,
  },
]

export type CommonCondition = typeof COMMON_CONDITIONS[number]

export type CommonConditionKey = (typeof COMMON_CONDITIONS)[number]['key']

export const COMMON_CONDITION_KEYS: CommonConditionKey[] = COMMON_CONDITIONS
  .map((c) => c.key)

export const commonConditionSnomedConceptId = memoize(
  (key: CommonConditionKey): string => {
    const condition = COMMON_CONDITIONS.find((c) => c.key === key)
    assert(condition)
    return condition.snomed_concept_id
  },
)
