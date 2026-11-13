import { z } from 'zod'
import { assert } from 'std/assert/assert.ts'
import { postHandler } from '../../../../../../../../../backend/postHandler.ts'
import { workflowStepFromReferer } from '../../../../../../../../../backend/workflowStepFromReferer.ts'
import type { OpenEncounterContext } from '../../../../../../../../../types.ts'
import { patient_procedures } from '../../../../../../../../../db/models/patient_procedures.ts'
import { markFindingEnteredInError } from '../../../../../../../../../db/models/patient_records_base.ts'
import { events } from '../../../../../../../../../db/models/events.ts'
import { workflowStepSnomedConcept } from '../../../../../../../../../shared/workflow.ts'
import { assertOr400 } from '../../../../../../../../../util/assertOr.ts'
import { json } from '../../../../../../../../../util/responses.ts'

export const MarkFindingAsErrorSchema = z.object({
  record_id: z.string().uuid(),
})

/*
  Retracts a single finding entered earlier in this encounter, attributing the retraction to
  the procedure for the step the health worker is on, which the referer identifies the same
  way the sibling clinical_finding route does.
*/
export const handler = postHandler(
  MarkFindingAsErrorSchema,
  async (ctx: OpenEncounterContext, { record_id }) => {
    const {
      trx,
      patient_id,
      employment_id,
      patient_encounter_id,
      patient_age_determination,
      encounter_employee_presence,
    } = ctx.state

    assertOr400(encounter_employee_presence, 'You must be present with the patient to mark a finding as entered in error')

    const { workflow, step } = workflowStepFromReferer(ctx)

    const workflow_step_snomed_concept = workflowStepSnomedConcept(workflow, step)
    assert(workflow_step_snomed_concept, `No workflow_step_snomed_concept for ${workflow} ${step}`)

    // Nothing is being performed here, so we never create a procedure. Anything retractable
    // was entered under the step's procedure, so by now there is one to attribute this to.
    const procedure = await patient_procedures.previouslyCompletedWorkflowStepQuery(trx, {
      patient_encounter_id,
      workflow_step_snomed_concept,
    }).executeTakeFirst()
    assertOr400(procedure, `No ${workflow} ${step} procedure has been completed for this encounter`)

    const marked = await markFindingEnteredInError(trx, {
      patient_id,
      patient_encounter_id,
      employment_id,
      procedure_id: procedure.id,
      record_id,
    })
    assertOr400(marked, `No valid finding ${record_id} in this patient's open encounter`)

    await events.insert(trx, {
      type: 'SingleFindingMarkedAsError',
      data: {
        workflow,
        step,
        patient_id,
        patient_encounter_id,
        patient_age_determination,
        procedure_id: procedure.id,
        altered_record_id: record_id,
      },
    })

    return json({ success: true })
  },
)
