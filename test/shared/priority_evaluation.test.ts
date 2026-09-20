import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { buildPriorityEvaluation, dueToHypotheticalRelation } from '../../shared/priority_evaluation.ts'
import { parseSExpressionAsInsertableFinding } from '../../shared/parseSExpressionAsInsertableFinding.ts'
import { diagnosisToEvaluation } from '../../shared/diagnosis.ts'
import { PRIORITY_SNOMED_CODES } from '../../shared/priorities.ts'

const insect_bite = parseSExpressionAsInsertableFinding(
  '(finding (snomed_concept "Clinical finding" finding) (snomed_concept "Insect bite - wound" disorder))',
)

const possible_anaphylaxis = diagnosisToEvaluation({
  snomed_concept: { atom: 'snomed_concept', name: 'Anaphylaxis', category: 'disorder' },
  certainty_qualifier: 'possible',
})

const created_at = new Date('2026-09-19T10:00:00Z')

function contextLines(evaluation: ReturnType<typeof buildPriorityEvaluation>) {
  return evaluation.source_relations!.map((relation) => `${relation.relation_name}: ${relation.displays.full}`)
}

describe('shared/priority_evaluation.ts', () => {
  it('displays as the priority itself, with the records it is due to as source relations', () => {
    const evaluation = buildPriorityEvaluation({
      priority: 'Emergency',
      created_at,
      due_to: [insect_bite, possible_anaphylaxis].map(dueToHypotheticalRelation),
    })

    assertEquals(evaluation.type, 'evaluation')
    assertEquals(evaluation.displays, { finding: 'Emergency', value: null, full: 'Emergency' })
    assertEquals(evaluation.specific_snomed_concept_id, PRIORITY_SNOMED_CODES['Emergency'])
    assertEquals(evaluation.created_at, created_at)
    // No health worker raised it
    assertEquals(evaluation.provider, null)
    assertEquals(contextLines(evaluation), [
      'Due to: Insect bite - wound',
      'Due to: Anaphylaxis Diagnosis: Possible diagnosis',
    ])
  })

  it('adds the system priority evaluation rule it is based on, where one is known', () => {
    const evaluation = buildPriorityEvaluation({
      priority: 'Very urgent',
      created_at,
      due_to: [dueToHypotheticalRelation(insect_bite)],
      based_on: 'Very urgent: Anaphylaxis',
    })

    assertEquals(contextLines(evaluation), [
      'Due to: Insect bite - wound',
      'Based on: Very urgent: Anaphylaxis',
    ])
  })
})
