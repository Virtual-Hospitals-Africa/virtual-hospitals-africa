import { assertEquals } from 'std/assert/assert_equals.ts'
import { describe, it } from 'std/testing/bdd.ts'
import { groupRecordsByWorkflows } from '../../db/models/this_visit_findings.ts'
import { EVALUATION_PROCEDURE } from '../../shared/snomed_concepts.ts'
import { RenderedFindingRelativeToHealthWorker, RenderedPatientEncounter } from '../../types.ts'

// A finding recorded under triage's additional tasks step, which the health worker
// then left without completing
const collapse = {
  id: 'collapse',
  type: 'finding',
  existence: 'Yes',
  value: null,
  priority: 'Emergency',
  score: null,
  displays: { value: null, finding: 'Collapse', full: 'Collapse' },
  as_part_of_procedure: {
    specific_snomed_concept_id: EVALUATION_PROCEDURE.id,
    workflow_step_name: 'additional_tasks_and_investigations',
  },
} as never as RenderedFindingRelativeToHealthWorker

const encounter = {
  workflows: {
    triage: {
      workflow: 'triage',
      status: 'in progress',
      steps_completed: ['warning_signs', 'brief_history', 'height_and_weight', 'measure_vitals'],
    },
    registration: {
      workflow: 'registration',
      status: 'in progress',
      steps_completed: [],
    },
  },
} as never as RenderedPatientEncounter

describe('db/models/this_visit_findings.ts', () => {
  describe('groupRecordsByWorkflows', () => {
    it('shows a step left incomplete as in progress when it has records and the health worker is on another workflow', () => {
      const grouped = groupRecordsByWorkflows({
        records: [collapse],
        encounter,
        current_workflow_state: {
          workflow: 'registration',
          step: 'this_visit',
        } as never,
      })

      assertEquals(grouped.length, 1)
      const [triage] = grouped
      assertEquals(triage.workflow, 'triage')
      assertEquals(
        triage.steps.map((step) => [step.workflow_step, step.status, step.records.length]),
        [
          ['warning_signs', 'completed', 0],
          ['brief_history', 'completed', 0],
          ['height_and_weight', 'completed', 0],
          ['measure_vitals', 'completed', 0],
          ['additional_tasks_and_investigations', 'in progress', 1],
        ],
      )
    })

    it('omits steps not yet started', () => {
      const grouped = groupRecordsByWorkflows({
        records: [],
        encounter,
        current_workflow_state: {
          workflow: 'triage',
          step: 'additional_tasks_and_investigations',
        } as never,
      })

      const [triage] = grouped
      assertEquals(
        triage.steps.map((step) => [step.workflow_step, step.status]),
        [
          ['warning_signs', 'completed'],
          ['brief_history', 'completed'],
          ['height_and_weight', 'completed'],
          ['measure_vitals', 'completed'],
          ['additional_tasks_and_investigations', 'in progress'],
        ],
      )
    })
  })
})
