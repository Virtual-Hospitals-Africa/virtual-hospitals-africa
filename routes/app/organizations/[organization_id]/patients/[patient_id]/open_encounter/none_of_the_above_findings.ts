import { assert } from 'std/assert/assert.ts'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import { workflowStepFromReferer } from '../../../../../../../backend/workflowStepFromReferer.ts'
import type { OpenEncounterContext } from '../../../../../../../types.ts'
import { NegativeFindingToInsert, patient_findings } from '../../../../../../../db/models/patient_findings.ts'
import { patient_procedures } from '../../../../../../../db/models/patient_procedures.ts'
import { additional_tasks, existingFindingsMatching, isCheckFor } from '../../../../../../../db/models/additional_tasks.ts'
import { events } from '../../../../../../../db/models/events.ts'
import { workflowStepSnomedConcept } from '../../../../../../../shared/workflow.ts'
import { getTaskById } from '../../../../../../../shared/tasks.ts'
import { inverseSExpression } from '../../../../../../../shared/s_expression_inverse.ts'
import { NO_QUALIFIER } from '../../../../../../../shared/snomed_concepts.ts'
import { NoneOfTheAboveFindingsResponse, NoneOfTheAboveFindingsSchema } from '../../../../../../../shared/none_of_the_above_findings_post.ts'
import { assertOr400 } from '../../../../../../../util/assertOr.ts'
import { json } from '../../../../../../../util/responses.ts'
import { asResult } from '../../../../../../../util/asResult.ts'
import generateUUID from '../../../../../../../util/uuid.ts'
import uniq from '../../../../../../../util/uniq.ts'
import type { InsertableFindingBase, MatchingFinding } from '../../../../../../../shared/s_expression_schemas.ts'

/*
  The health worker has looked at the findings the check_for tasks asked them to check for and
  none of those still unchecked apply. Each is recorded as a negative finding under the
  procedure for the step they are on, identified from the referer as the sibling
  clinical_finding route does, and that same procedure marks every one of the tasks done. With
  every finding a task asks about recorded, it shows as complete whether or not it was marked done.

  A finding that several of the tasks ask about is sent once and recorded once.

  The one FindingsAdded dispatched names the tasks, so that the diagnosis rules can rule out the
  possible diagnoses they were due to. It is dispatched even when every finding already had a
  record, since a finding checked in the meantime may have left a task answered without
  anyone having said so, and it does not wait on the tasks having been marked done.

  The step's procedure already exists: the follow ups a check_for task is shown in only
  appear once a sign has been saved through the clinical_finding route, which creates the
  procedure for the step under the same workflow step concept.

  Findings that already have a record in this encounter, positive or negative, are left
  alone so that a repeated click or a finding checked in the meantime records nothing new.
*/
export const handler = postHandler(
  NoneOfTheAboveFindingsSchema,
  async (ctx: OpenEncounterContext, { completed_task_descriptions, s_expressions }) => {
    const {
      trx,
      patient_id,
      employment_id,
      patient_encounter_id,
      patient_age_determination: maybe_patient_age_determination,
      encounter_employee_presence,
    } = ctx.state

    assertOr400(encounter_employee_presence, 'You must be present with the patient to submit findings')
    const { patient_encounter_employee_id } = encounter_employee_presence
    assertOr400(maybe_patient_age_determination, 'Need patient age to record findings')
    // Narrowed here so the nested functions below see it as non-null
    const patient_age_determination = maybe_patient_age_determination

    for (const s_expression of s_expressions) {
      assertOr400(s_expression.existence === 'Yes', 'Send the findings to check for as positive findings, they are recorded as negative here')
    }

    // The same task twice would mark it done twice
    const task_descriptions = uniq(completed_task_descriptions)
    for (const task_description of task_descriptions) {
      const task = asResult(() => getTaskById(task_description))
      assertOr400(task.success && isCheckFor(task.value.to_be_done), `"${task_description}" is not a check_for task`)
    }

    const { workflow, step } = workflowStepFromReferer(ctx)

    const workflow_step_snomed_concept = workflowStepSnomedConcept(workflow, step)
    assert(workflow_step_snomed_concept, `No workflow_step_snomed_concept for ${workflow} ${step}`)

    const nodes = new Map<string, InsertableFindingBase>()
    for (const node of s_expressions) {
      nodes.set(inverseSExpression(node), node)
    }

    // A record of any existence counts, so the same lookup the additional tasks page uses
    const matching = new Map<string, MatchingFinding>(
      nodes.entries().map(([s_expression, node]) => [s_expression, { ...node, existence: 'Any' }]),
    )
    const existing_findings = await existingFindingsMatching(trx, { patient_id, patient_encounter_id, nodes: matching })
    const already_recorded = new Set(existing_findings.map((finding) => finding.s_expression))

    const to_insert = [...nodes.entries()]
      .filter(([s_expression]) => !already_recorded.has(s_expression))
      .map(([s_expression, node]) => {
        const id = generateUUID()
        const finding: NegativeFindingToInsert = {
          ...node,
          id,
          existence: 'No',
          value_snomed_concept: { atom: 'snomed_concept', ...NO_QUALIFIER },
        }
        return { id, s_expression, finding }
      })

    const procedure = await patient_procedures.previouslyCompletedWorkflowStepQuery(trx, {
      patient_encounter_id,
      workflow_step_snomed_concept,
    }).executeTakeFirst()
    assertOr400(procedure, `No ${step} procedure to record these findings under`)
    const procedure_id = procedure.id

    if (to_insert.length) await insertNegatives()

    for (const task_description of task_descriptions) {
      await additional_tasks.markTaskDone(trx, {
        patient_id,
        patient_encounter_id,
        procedure_id,
        task_description,
      })
    }

    await events.insert(trx, {
      type: 'FindingsAdded',
      data: {
        patient_id,
        patient_encounter_id,
        patient_age_determination,
        procedure_id,
        records: to_insert.map(({ id }) => ({ id, existence: 'No' as const })),
        completed_task_descriptions: task_descriptions,
      },
    })

    return json(
      {
        success: true,
        records: to_insert.map(({ id, s_expression }) => ({ id, s_expression })),
      } satisfies NoneOfTheAboveFindingsResponse,
    )

    async function insertNegatives(): Promise<void> {
      const { records } = await patient_findings.insertManyNegative(
        trx,
        {
          patient_id,
          employment_id,
          patient_encounter_id,
          patient_encounter_employee_id,
          findings: to_insert.map(({ finding }) => finding),
          procedure: { procedure_id },
        },
      )
      assert(records.length === to_insert.length)
    }
  },
)
