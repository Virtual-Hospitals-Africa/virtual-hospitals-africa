import { CommonSymptom } from '../types.ts'
import { keyBy } from '../util/keyBy.ts'
import { normalForm } from './s_expression.ts'

export const COMMON_SYMPTOMS_LIST: CommonSymptom[] = [
  {
    'key': 'Nasal discharge' as const,
    'clinical_finding_s_expression': normalForm(`(clinical_finding (snomed_concept "Nasal discharge" "finding"))`),
    'primary_name': 'Nasal discharge',
    'secondary_text': 'Runny nose',
    'category': 'Common Symptoms' as const,
  },
]

export const COMMON_SYMPTOMS = keyBy(COMMON_SYMPTOMS_LIST, 'key')
