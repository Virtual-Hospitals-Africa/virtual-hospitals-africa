import { z } from 'zod'
import { assert } from 'std/assert/assert.ts'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import type { OpenEncounterContext } from '../../../../../../../types.ts'
import type { Workflow } from '../../../../../../../db.d.ts'
import { FindingNodeToInsert, patient_findings } from '../../../../../../../db/models/patient_findings.ts'
import { patient_procedures } from '../../../../../../../db/models/patient_procedures.ts'
import { markEnteredInError } from '../../../../../../../db/models/patient_records_base.ts'
import { events } from '../../../../../../../db/models/events.ts'
import { WORKFLOW_STEPS, workflowStepSnomedConcept } from '../../../../../../../shared/workflow.ts'
import { assertOr400 } from '../../../../../../../util/assertOr.ts'
import { json } from '../../../../../../../util/responses.ts'
import compact from '../../../../../../../util/compact.ts'
import { ClinicalFindingSchema } from '../../../../../../../shared/clinical_finding_post.ts'

/*
  This route sits outside any workflow. The workflow is the patient's current one,
  but the encounter only tracks which steps are complete, not which step page the
  health worker is on (they may be revisiting a completed step). So the step comes
  from the referer, whose path must be a step of the current workflow declared in
  shared/workflow.ts for this very encounter.
*/
function workflowStepFromReferer(
  ctx: OpenEncounterContext,
): { workflow: Workflow; step: string } {
  const { current_workflow } = ctx.state.encounter.status.patient_presence
  assertOr400(current_workflow, 'The patient must be in a workflow to add a finding')

  const referer = ctx.req.headers.get('referer')
  assertOr400(referer, 'Missing referer header, expected to be sent from a workflow step page')

  const { pathname } = new URL(referer, ctx.url.origin)
  const workflow_step_prefix = `${ctx.state.open_encounter_pathname}/${current_workflow}/`
  assertOr400(
    pathname.startsWith(workflow_step_prefix),
    `Expected referer to be a ${current_workflow} step page of this patient's open encounter, got: ${pathname}`,
  )

  const [step, ...rest] = compact(pathname.slice(workflow_step_prefix.length).split('/'))
  assertOr400(step && WORKFLOW_STEPS[current_workflow].includes(step), `Invalid step in referer for ${current_workflow}: ${step}`)
  assertOr400(rest.length === 0, `Unexpected trailing path in referer: ${pathname}`)

  return { workflow: current_workflow, step }
}

export const handler = postHandler(
  ClinicalFindingSchema,
  async (ctx: OpenEncounterContext, { finding_id, s_expression, priority_level, entered_in_error_record_id }) => {
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

    if (entered_in_error_record_id) {
      await markEnteredInError(trx, {
        patient_id,
        employment_id,
        patient_encounter_id,
        procedure_id,
        altered_record_ids: [entered_in_error_record_id],
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
