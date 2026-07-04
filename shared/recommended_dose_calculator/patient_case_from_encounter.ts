import type { RenderedEvaluationRelativeToHealthWorker, RenderedSidebarWorkflow } from '../../types.ts'
import { isPositiveDiagnosis } from '../diagnosis.ts'

export function* positiveRecordsFromEncounter({
  this_visit_diagnoses,
  this_visit_findings,
}: {
  this_visit_diagnoses: RenderedEvaluationRelativeToHealthWorker[]
  this_visit_findings: RenderedSidebarWorkflow[]
}) {
  for (const diagnosis of this_visit_diagnoses) {
    if (isPositiveDiagnosis(diagnosis)) {
      yield diagnosis
    }
  }

  for (const workflow of this_visit_findings) {
    for (const step of workflow.steps) {
      for (const record of step.records) {
        if (record.type === 'finding' && record.existence === 'Yes' && record.value?.type !== 'measurement') {
          yield record
        } else if (record.type === 'evaluation') {
          yield record
        }
      }
    }
  }
}
