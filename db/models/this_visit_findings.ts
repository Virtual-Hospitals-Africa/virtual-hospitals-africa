import { assert } from 'std/assert/assert.ts'
import { prettyStepName, WORKFLOW_STEPS, WORKFLOWS, workflowStepSnomedConcept } from '../../shared/workflow.ts'
import {
  CurrentWorkflowState,
  RenderedFindingRelativeToHealthWorker,
  RenderedPatientEncounter,
  RenderedSidebarWorkflow,
  TrxOrDbOrQueryCreator,
} from '../../types.ts'
import { arrayIsNonEmpty } from '../../util/arraySize.ts'
import { groupBy } from '../../util/groupBy.ts'
import { humanReadableJson } from '../../util/humanReadableJson.ts'
import { patient_findings } from './patient_findings.ts'
import { patient_record_providers } from './patient_record_providers.ts'
import compactMap from '../../util/compactMap.ts'
import { VITAL_MEASUREMENTS_SNOMED_CONCEPTS } from '../../shared/vitals.ts'
import isString from '../../util/isString.ts'
import { priorityOrder } from '../../shared/sats.ts'
import sortBy from '../../util/sortBy.ts'

function* findAndCombineBloodPressure(
  records: RenderedFindingRelativeToHealthWorker[],
) {
  let blood_pressure_systolic: RenderedFindingRelativeToHealthWorker | undefined
  let blood_pressure_diastolic: RenderedFindingRelativeToHealthWorker | undefined

  for (const record of records) {
    if (record.specific_snomed_concept_id === VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_pressure_systolic.id) {
      blood_pressure_systolic = record
      continue
    }
    if (record.specific_snomed_concept_id === VITAL_MEASUREMENTS_SNOMED_CONCEPTS.blood_pressure_diastolic.id) {
      blood_pressure_diastolic = record
      continue
    }
    yield record
  }

  if (blood_pressure_systolic) {
    assert(blood_pressure_diastolic)
    assert(blood_pressure_systolic.value)
    assert(blood_pressure_systolic.value.type === 'measurement')
    assert(blood_pressure_diastolic.value)
    assert(blood_pressure_diastolic.value.type === 'measurement')

    const systolic = blood_pressure_systolic.value.value
    const diastolic = blood_pressure_diastolic.value.value
    assert(isString(systolic))
    assert(isString(diastolic))

    const finding = 'Blood pressure'
    const value = `${systolic}/${diastolic} mmHg`
    const full = `${finding}: ${value}`

    const record = structuredClone(blood_pressure_systolic)
    record.displays = { finding, value, full }
    yield record
    blood_pressure_systolic = undefined
    blood_pressure_diastolic = undefined
  }
}

function combineAndSortRecords(records: RenderedFindingRelativeToHealthWorker[]) {
  return sortBy(
    findAndCombineBloodPressure(records),
    priorityOrder,
    (record) => record.value?.type === 'measurement' ? 1 : 0,
  )
}

function groupRecordsByWorkflows(
  { records, encounter, current_workflow_state }: {
    records: RenderedFindingRelativeToHealthWorker[]
    encounter: RenderedPatientEncounter
    current_workflow_state: null | CurrentWorkflowState
  },
): RenderedSidebarWorkflow[] {
  const records_by_procedure = groupBy(
    records,
    (record) => record.as_part_of_procedure.specific_snomed_concept_id,
  )

  const grouped_records = compactMap(WORKFLOWS, (workflow) => {
    const workflow_status = encounter.workflows[workflow]
    if (!workflow_status) return null
    if (workflow === 'registration') return null

    const workflow_steps = WORKFLOW_STEPS[workflow]

    return {
      workflow,
      status: workflow_status.status,
      steps: workflow_steps.map((workflow_step) => {
        const workflow_step_snomed_concept = workflowStepSnomedConcept(workflow, workflow_step)

        const records_of_concept = (workflow_step_snomed_concept &&
          records_by_procedure.get(workflow_step_snomed_concept.id)) || []

        const completed = arrayIsNonEmpty(workflow_status.steps_completed) ? workflow_status.steps_completed.includes(workflow_step) : false

        const in_progress = current_workflow_state?.workflow === workflow &&
          current_workflow_state?.step === workflow_step

        return {
          workflow_step,
          title: prettyStepName(workflow_step),
          status: completed ? 'completed' as const : in_progress ? 'in progress' as const : 'not started' as const,
          records: combineAndSortRecords(records_of_concept),
        }
      }).filter((step) => step.status !== 'not started'),
    }
  })

  const remaining_records = new Set(records)
  for (const workflow of grouped_records) {
    for (const step of workflow.steps) {
      for (const record of step.records) {
        remaining_records.delete(record)
      }
    }
  }
  for (const remaining_record of remaining_records) {
    if (remaining_record.displays.finding === 'Diastolic blood pressure') continue
    if (remaining_record.displays.finding === 'Systolic blood pressure') continue
    throw new Error(
      `Expected all records to be accounted for\n${humanReadableJson(Array.from(remaining_records))}`,
    )
  }

  return grouped_records
}

export const this_visit_findings = {
  async get(
    trx: TrxOrDbOrQueryCreator,
    { health_worker_id, encounter, current_workflow_state }: {
      health_worker_id: string
      encounter: RenderedPatientEncounter
      current_workflow_state: null | CurrentWorkflowState
    },
  ): Promise<RenderedSidebarWorkflow[]> {
    const records = await patient_findings.findAll(trx, {
      patient_id: encounter.patient.id,
      patient_encounter_id: encounter.patient_encounter_id,
    })

    const hydrated = await patient_record_providers.hydrateIntermediateRecords(
      trx,
      { records, health_worker_id, encounter },
    )

    return groupRecordsByWorkflows({
      encounter,
      current_workflow_state,
      records: hydrated,
    })
  },
}
