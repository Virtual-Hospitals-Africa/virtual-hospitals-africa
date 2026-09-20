import { RenderedEvaluationRelativeToHealthWorker, RenderedFindingRelativeToHealthWorker, RenderedPatientEncounter } from '../../types.ts'
import findMatching from '../../util/findMatching.ts'
import { buildPriorityEvaluation, dueToRelation } from '../../shared/priority_evaluation.ts'

type PriorityObject = NonNullable<RenderedPatientEncounter['priority']>

export function buildPriorityRecord(
  priority: PriorityObject,
  patient_findings: RenderedFindingRelativeToHealthWorker[],
  diagnoses: RenderedEvaluationRelativeToHealthWorker[],
  total_scores: Array<Omit<RenderedEvaluationRelativeToHealthWorker, 'provider' | 'score'> & { score: number }>,
): RenderedEvaluationRelativeToHealthWorker {
  const all_records = [...patient_findings, ...diagnoses, ...total_scores]

  const due_to = priority.records
    .flatMap(({ associated_finding_ids }) => associated_finding_ids.map((finding_id) => dueToRelation(findMatching(all_records, { id: finding_id }))))

  return buildPriorityEvaluation({
    priority: priority.name,
    id: priority.records[0].id,
    value_snomed_concept_id: priority.value_snomed_concept_id,
    created_at: priority.created_at,
    due_to,
    based_on: priority.based_on_system_priority_evaluation_description,
  })
}
