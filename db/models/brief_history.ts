import { assert } from 'std/assert/assert.ts'
import memoize from '../../util/memoize.ts'

export const HISTORY_TAKING_BRIEF_SNOMED_CONCEPT_ID = '203421005' // |History taking, limited (procedure)|'

export const COMMON_CONDITIONS = [
  { id: 'diabetes' as const, label: 'Diabetes', snomed_concept_id: '73211009' },
  {
    id: 'pregnancy' as const,
    label: 'Pregnancy',
    snomed_concept_id: '77386006',
  },
  {
    id: 'tuberculosis' as const,
    label: 'Tuberculosis',
    snomed_concept_id: '56717001',
  },
  {
    id: 'hiv' as const,
    label: 'Human Immunodeficiency Virus',
    snomed_concept_id: '86406008',
  },
  { id: 'asthma' as const, label: 'Asthma', snomed_concept_id: '195967001' },
  {
    id: 'copd' as const,
    label: 'Chronic Obstructive Pulmonary Disease',
    snomed_concept_id: '13645005',
  },
  {
    id: 'coronavirus' as const,
    label: 'Coronavirus',
    snomed_concept_id: '186747009',
  },
  {
    id: 'heart_disease' as const,
    label: 'Heart Disease',
    snomed_concept_id: '56265001',
  },
  {
    id: 'mental_disorder' as const,
    label: 'Mental Disorder',
    snomed_concept_id: '74732009',
  },
  { id: 'epilepsy' as const, label: 'Epilepsy', snomed_concept_id: '84757009' },
  {
    id: 'arthritis' as const,
    label: 'Arthritis',
    snomed_concept_id: '3723001',
  },
  { id: 'cancer' as const, label: 'Cancer', snomed_concept_id: '363346000' },
]

export type CommonConditionKey = (typeof COMMON_CONDITIONS)[number]['id']

export const COMMON_CONDITION_KEYS: CommonConditionKey[] = COMMON_CONDITIONS
  .map((c) => c.id)

export const commonConditionSnomedConceptId = memoize(
  (key: CommonConditionKey): string => {
    const condition = COMMON_CONDITIONS.find((c) => c.id === key)
    assert(condition)
    return condition.snomed_concept_id
  },
)
