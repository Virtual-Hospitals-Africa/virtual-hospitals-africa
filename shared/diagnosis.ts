import { Lang } from './s_expression_schemas.ts'
import {
  DEFINITE,
  DIAGNOSIS,
  EQUIVOCAL,
  IMPROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  POSSIBLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  PROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
} from './snomed_concepts.ts'

export function diagnosisToEvaluation(diagnosis: {
  snomed_concept: Lang['snomed_concept']
  certainty_qualifier?: Lang['diagnosis']['certainty_qualifier']
}): Lang['evaluation'] {
  const certainty_qualifier_map = {
    'definite': DEFINITE,
    'probable': PROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
    'equivocal': EQUIVOCAL,
    'possible': POSSIBLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
    'improbable': IMPROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  } as const

  const certainty_qualifier_concept = diagnosis.certainty_qualifier ? certainty_qualifier_map[diagnosis.certainty_qualifier] : null

  return {
    atom: 'evaluation',
    root_snomed_concept: {
      atom: 'snomed_concept',
      name: DIAGNOSIS.name,
      category: DIAGNOSIS.category,
    },
    specific_snomed_concept: diagnosis.snomed_concept,
    value_snomed_concept: certainty_qualifier_concept && {
      atom: 'snomed_concept',
      name: certainty_qualifier_concept.name,
      category: certainty_qualifier_concept.category,
    },
    evaluates: null,
    qualifiers: [],
    attributes: [],
  }
}
