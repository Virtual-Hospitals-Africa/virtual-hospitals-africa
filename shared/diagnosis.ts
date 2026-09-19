import { assert } from 'std/assert/assert.ts'
import { Lang } from './s_expression_schemas.ts'
import {
  DEFINITE,
  DIAGNOSIS,
  EQUIVOCAL,
  IMPROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  POSSIBLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  PROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
} from './snomed_concepts.ts'
import { RenderedEvaluationRelativeToHealthWorker } from '../types.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertUnreachable } from '../util/assertUnreachable.ts'
import type { DiagnosisCertainty } from '../db.d.ts'
import sortBy from '../util/sortBy.ts'

export const CERTAINTY_QUALIFIER_TO_CONCEPT = {
  'definite': DEFINITE,
  'probable': PROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  'equivocal': EQUIVOCAL,
  'possible': POSSIBLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
  'improbable': IMPROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER,
} as const

const CONCEPT_NAME_TO_CERTAINTY_QUALIFIER = {
  [DEFINITE.name]: 'definite' as const,
  [PROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER.name]: 'probable' as const,
  [EQUIVOCAL.name]: 'equivocal' as const,
  [POSSIBLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER.name]: 'possible' as const,
  [IMPROBABLE_DIAGNOSIS_CONTEXTUAL_QUALIFIER.name]: 'improbable' as const,
}
assertEquals(
  Object.keys(CERTAINTY_QUALIFIER_TO_CONCEPT).length,
  Object.keys(CONCEPT_NAME_TO_CERTAINTY_QUALIFIER).length,
)

export function certaintyOf(diagnosis: RenderedEvaluationRelativeToHealthWorker): keyof typeof CERTAINTY_QUALIFIER_TO_CONCEPT {
  assert(diagnosis.value?.type === 'snomed_concept')
  const certainty = CONCEPT_NAME_TO_CERTAINTY_QUALIFIER[diagnosis.value.name]
  assert(certainty)
  return certainty
}

export function isPositiveDiagnosis(
  diagnosis: RenderedEvaluationRelativeToHealthWorker,
) {
  const certainty = certaintyOf(diagnosis)
  switch (certainty) {
    case 'definite':
    case 'probable':
    case 'possible':
      return true
    case 'equivocal':
    case 'improbable':
      return false
    default:
      assertUnreachable(certainty)
  }
}

export function diagnosisToEvaluation(diagnosis: {
  snomed_concept?: Lang['snomed_concept']
  certainty_qualifier?: Lang['diagnosis']['certainty_qualifier']
}): Lang['evaluation'] {
  const certainty_qualifier_concept = diagnosis.certainty_qualifier ? CERTAINTY_QUALIFIER_TO_CONCEPT[diagnosis.certainty_qualifier] : null

  return {
    atom: 'evaluation',
    root_snomed_concept: {
      atom: 'snomed_concept',
      name: DIAGNOSIS.name,
      category: DIAGNOSIS.category,
    },
    specific_snomed_concept: diagnosis.snomed_concept || null,
    value_snomed_concept: certainty_qualifier_concept && {
      atom: 'snomed_concept',
      name: certainty_qualifier_concept.name,
      category: certainty_qualifier_concept.category,
    },
    evaluates: null,
    history: true,
    qualifiers: [],
    attributes: [],
  }
}

export const CERTAINTY_ORDER: Record<DiagnosisCertainty, number> = {
  definite: 4,
  probable: 3,
  equivocal: 2,
  possible: 1,
  improbable: 0,
}

type DiagnosisEffect = {
  snomed_concept: { id: string; name: string }
  certainty: DiagnosisCertainty
}

export type DiagnosisEffectGroup<E extends DiagnosisEffect> = {
  // Every rule effect indicating this concept, in the order given
  diagnosis: E[]
  // The one the pipeline would record: the highest certainty among them
  strongest: E
}

/*
  The real pipeline records one diagnosis per concept, at the highest certainty any applicable
  rule gives it (system_diagnosis_rules.insertPositiveDiagnoses). Groups are sorted by concept
  name so callers are deterministic.
*/
export function groupDiagnosisEffectsByConcept<E extends DiagnosisEffect>(effects: E[]): DiagnosisEffectGroup<E>[] {
  const by_concept = new Map<string, E[]>()
  for (const effect of effects) {
    const group = by_concept.get(effect.snomed_concept.id)
    if (group) group.push(effect)
    else by_concept.set(effect.snomed_concept.id, [effect])
  }
  return sortBy([...by_concept.values()], (group) => group[0].snomed_concept.name).map((diagnosis) => ({
    diagnosis,
    strongest: diagnosis.reduce((best, effect) => CERTAINTY_ORDER[effect.certainty] > CERTAINTY_ORDER[best.certainty] ? effect : best),
  }))
}
