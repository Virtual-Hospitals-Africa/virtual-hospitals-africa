import { assert } from 'std/assert/assert.ts'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import { workflowStepFromReferer } from '../../../../../../../backend/workflowStepFromReferer.ts'
import type { OpenEncounterContext } from '../../../../../../../types.ts'
import { FindingNodeToInsert, patient_findings } from '../../../../../../../db/models/patient_findings.ts'
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
import { promiseProps } from '../../../../../../../util/promiseProps.ts'
import generateUUID from '../../../../../../../util/uuid.ts'
import type { InsertableFindingBase, MatchingFinding } from '../../../../../../../shared/s_expression_schemas.ts'

/*
  The health worker has looked at the findings a check_for task asked them to check for and
  none of those still unchecked apply. Each is recorded as a negative finding under the
  procedure for the step they are on, identified from the referer as the sibling
  clinical_finding route does, and that same procedure marks the task done.

  The step's procedure already exists: the follow ups a check_for task is shown in only
  appear once a sign has been saved through the clinical_finding route, which creates the
  procedure for the step under the same workflow step concept.

  Findings that already have a record in this encounter, positive or negative, are left
  alone so that a repeated click or a finding checked in the meantime records nothing new.
*/
export const handler = postHandler(
  NoneOfTheAboveFindingsSchema,
  async (ctx: OpenEncounterContext, { task_id, s_expressions }) => {
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

    const task = asResult(() => getTaskById(task_id))
    assertOr400(task.success && isCheckFor(task.value.to_be_done), `"${task_id}" is not a check_for task`)

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
        const finding: FindingNodeToInsert = {
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

    // Nothing here depends on the other: the task is answered by this procedure either way
    await promiseProps({
      inserted: to_insert.length ? insertNegatives() : Promise.resolve(),
      marked: additional_tasks.markTaskDone(trx, {
        patient_id,
        patient_encounter_id,
        patient_age_determination,
        procedure_id,
        task_id,
      }),
    })

    if (to_insert.length) {
      await events.insert(trx, {
        type: 'RecordsAdded',
        data: {
          patient_id,
          patient_encounter_id,
          patient_age_determination,
          procedure_id,
          records: to_insert.map(({ id }) => ({ id, existence: 'No' as const })),
          task_completed_id: task_id,
        },
      })
    }

    return json(
      {
        success: true,
        records: to_insert.map(({ id, s_expression }) => ({ id, s_expression })),
      } satisfies NoneOfTheAboveFindingsResponse,
    )

    async function insertNegatives(): Promise<void> {
      const { success, findings } = await patient_findings.insertMany(
        trx,
        {
          patient_id,
          employment_id,
          patient_encounter_id,
          patient_age_determination,
          patient_encounter_employee_id,
          findings: to_insert.map(({ finding }) => finding),
          procedure: { procedure_id },
        },
      )
      assert(success)
      assert(findings.length === to_insert.length)
    }
  },
)
