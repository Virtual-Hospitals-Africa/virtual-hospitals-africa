import { keyBy } from '../util/keyBy.ts'

export const COMMON_SYMPTOMS_LIST = [
  {
    'key': 'Nasal discharge' as const,
    'clinical_finding_s_expression': `(clinical_finding (snomed_concept "Nasal discharge" "finding"))`,
    'primary_name': 'Nasal discharge',
    'secondary_text': 'Runny nose',
  },
]

export const COMMON_SYMPTOMS = keyBy(COMMON_SYMPTOMS_LIST, 'key')
