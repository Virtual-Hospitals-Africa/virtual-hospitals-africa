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

export const handler = postHandler(
  ClinicalFindingSchema,
  async (ctx: OpenEncounterContext, { finding_id, s_expression, priority_level, altered_record_id }) => {
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

    const { success, procedure_id, findings } = await patient_findings.insertMany(
      trx,
      {
        patient_id,
        employment_id,
        patient_encounter_id,
        patient_encounter_employee_id,
        findings: [finding_to_insert],
        procedure: {
          procedure_id: previously_completed_workflow_step_procedure_id,
          create_with_specific_snomed_concept_id: workflow_step_snomed_concept.id,
          if_not_already_exists: true,
        },
      },
    )
    assert(success)
    assert(procedure_id)
    assert(findings.length === 1 && findings[0].id === finding_id)

    if (altered_record_id) {
      await markAltered(trx, {
        patient_id,
        employment_id,
        patient_encounter_id,
        procedure_id,
        altered_record_ids: [altered_record_id],
      })
    }

    await events.insert(trx, {
      type: 'SinglePositiveFindingAdded',
      data: {
        workflow,
        step,
        patient_id,
        patient_encounter_id,
        patient_age_determination,
        procedure_id,
        positive_finding_id: finding_id,
      },
    })

    return json({ success: true })
  },
)
