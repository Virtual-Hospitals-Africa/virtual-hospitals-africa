import { assert } from 'std/assert/assert.ts'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import { workflowStepFromReferer } from '../../../../../../../backend/workflowStepFromReferer.ts'
import type { OpenEncounterContext } from '../../../../../../../types.ts'
import { FindingNodeToInsert, patient_findings } from '../../../../../../../db/models/patient_findings.ts'
import { patient_procedures } from '../../../../../../../db/models/patient_procedures.ts'
import { markAltered } from '../../../../../../../db/models/patient_records_base.ts'
import { events } from '../../../../../../../db/models/events.ts'
import { workflowStepSnomedConcept } from '../../../../../../../shared/workflow.ts'
import { assertOr400 } from '../../../../../../../util/assertOr.ts'
import { json } from '../../../../../../../util/responses.ts'
import { ClinicalFindingSchema } from '../../../../../../../shared/clinical_finding_post.ts'
import { patient_medications_self_reported } from '../../../../../../../db/models/patient_medications_self_reported.ts'
import { pMap } from '../../../../../../../util/inParallel.ts'

export const handler = postHandler(
  ClinicalFindingSchema,
  async (ctx: OpenEncounterContext, { finding_id, s_expression, medication_s_expressions = [], priority_level, altered_record_id }) => {
    const {
      trx,
      patient_id,
      employment_id,
      patient_encounter_id,
      patient_age_determination,
      encounter_employee_presence,
    } = ctx.state

    assertOr400(encounter_employee_presence, 'You must be present with the patient to submit findings')
    const { patient_encounter_employee_id } = encounter_employee_presence

    assertOr400(s_expression.existence === 'Yes', 'Only positive findings may be added through this route')
    assertOr400(patient_age_determination, 'Need patient age to insert finding')

    const { workflow, step } = workflowStepFromReferer(ctx)

    const workflow_step_snomed_concept = workflowStepSnomedConcept(workflow, step)
    assert(workflow_step_snomed_concept, `No workflow_step_snomed_concept for ${workflow} ${step}`)

    const previously_completed_workflow_step_procedure_id = patient_procedures.previouslyCompletedWorkflowStepQuery(trx, {
      patient_encounter_id,
      workflow_step_snomed_concept,
    })

    const finding_to_insert: FindingNodeToInsert = {
      ...s_expression,
      id: finding_id,
      priority: priority_level
        ? {
          level: priority_level,
          by_system: true,
        }
        : null,
    }

    const { procedure_id, records } = await patient_findings.insertOnePositive(
      trx,
      {
        patient_id,
        employment_id,
        patient_encounter_id,
        patient_age_determination,
        patient_encounter_employee_id,
        finding: finding_to_insert,
        procedure: {
          procedure_id: previously_completed_workflow_step_procedure_id,
          create_with_specific_snomed_concept_id: workflow_step_snomed_concept.id,
          if_not_already_exists: true,
        },
      },
    )
    assert(records.length === 1 && records.every(({ id }) => id === finding_id))

    // The medications the patient is taking due to this finding. The finding must exist first:
    // each medication is related to it and is entered under the same procedure.
    await pMap(medication_s_expressions, (medication_s_expression) =>
      patient_medications_self_reported.insertOne(trx, {
        patient_id,
        patient_encounter_id,
        finding_id,
        medication_s_expression,
      }))

    if (altered_record_id) {
      // The medications taken due to the altered finding are resubmitted with its replacement,
      // so those of the altered finding are altered along with it
      const altered_medication_ids = await patient_medications_self_reported.idsDueTo(trx, { finding_ids: [altered_record_id] })
      await markAltered(trx, {
        patient_id,
        employment_id,
        patient_encounter_id,
        procedure_id,
        altered_record_ids: [altered_record_id, ...altered_medication_ids],
      })
    }

    await events.insert(trx, {
      type: 'FindingsAdded',
      data: {
        patient_id,
        patient_encounter_id,
        patient_age_determination,
        procedure_id,
        records: [{
          id: finding_id,
          existence: 'Yes',
        }],
      },
    })

    return json({ success: true })
  },
)
