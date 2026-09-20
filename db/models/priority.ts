import { RenderedEvaluationRelativeToHealthWorker, RenderedFindingRelativeToHealthWorker, RenderedPatientEncounter } from '../../types.ts'
import matching from '../../util/matching.ts'
import compactMap from '../../util/compactMap.ts'
import { buildPriorityEvaluation, dueToRelation } from '../../shared/priority_evaluation.ts'

type PriorityObject = NonNullable<RenderedPatientEncounter['priority']>

export function buildPriorityRecord(
  priority: PriorityObject,
  patient_findings: RenderedFindingRelativeToHealthWorker[],
  diagnoses: RenderedEvaluationRelativeToHealthWorker[],
  total_scores: Array<Omit<RenderedEvaluationRelativeToHealthWorker, 'provider' | 'score'> & { score: number }>,
): RenderedEvaluationRelativeToHealthWorker {
  const all_records = [...patient_findings, ...diagnoses, ...total_scores]

  /*
    A priority rule may be due to records of other kinds too, an allergy alongside the exposure
    to the allergen for instance, which none of these lists hold. Those are left out of the
    due_to shown rather than failing the page.
  */
  const due_to = priority.records
    .flatMap(({ associated_finding_ids }) =>
      compactMap(associated_finding_ids, (finding_id) => {
        const record = all_records.find(matching({ id: finding_id }))
        return record && dueToRelation(record)
      })
    )

  return buildPriorityEvaluation({
    priority: priority.name,
    id: priority.records[0].id,
    value_snomed_concept_id: priority.value_snomed_concept_id,
    created_at: priority.created_at,
    due_to,
    based_on: priority.based_on_system_priority_evaluation_description,
  })
}
