import {
  completeAndProceedToNextStep,
  createProcedureIfNotAlreadyCompleted,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import AdditionalTasks from '../../../../../../../../components/triage/AdditionalTasks.tsx'
import { getTasksGroups } from '../../../../../../../../db/models/additional_tasks.ts'
import { yes_no_unknown } from '../../../../../../../../util/validators.ts'
import { parseExpressionExpectingAtom } from '../../../../../../../../shared/s_expression.ts'
import entries from '../../../../../../../../util/entries.ts'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { forEach } from '../../../../../../../../util/inParallel.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import type { Lang } from '../../../../../../../../shared/s_expression_schemas.ts'

const TriageAdditionalTasksAndInvestigationsSchema = z.object({
  just_do_it_tasks: z.record(
    z.string().uuid(), // procedure_id
    z.object({
      action_status_evaluation_id: z.string().uuid(),
      done: z.boolean(),
    }),
  ).optional().default({}).transform((tasks) =>
    entries(tasks).map(([procedure_id, task]) => ({
      procedure_id,
      task,
    }))
  ),
  check_for: z.record(
    z.string().uuid(), // procedure_id
    z.object({
      s_expression: z.string().transform((
        value,
      ) => parseExpressionExpectingAtom(value, 'finding')),
      existence: yes_no_unknown,
    }),
  ).optional().default({}).transform((check_for) =>
    entries(check_for).map(([procedure_id, task]) => ({
      procedure_id,
      task,
    }))
  ),
})

function findingSExpression(
  finding: Lang['finding'],
  existence: 'Yes' | 'No' | 'Unknown',
): Lang['finding'] {
  if (existence === 'Yes') {
    return finding
  }
  return {
    ...finding,
    qualifiers: [
      ...finding.qualifiers,
      {
        atom: 'qualifier',
        specific_snomed_concept: {
          atom: 'snomed_concept',
          type: 'snomed_concept_name_and_category',
          name: existence,
          category: 'qualifier value',
        },
        qualifiers: [],
      },
    ],
  }
}

export const handler = postHandler(
  TriageAdditionalTasksAndInvestigationsSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const {
      trx,
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
    } = ctx.state

    const { response } = await promiseProps({
      response: completeAndProceedToNextStep(ctx),
      _: insertCheckForFindings(),
    })
    return response

    async function insertCheckForFindings() {
      const { procedure_id } = await createProcedureIfNotAlreadyCompleted(ctx)

      return forEach(
        form_values.check_for,
        ({ procedure_id: _task_procedure_id, task }) => {
          if (task.existence === undefined) {
            return Promise.resolve('Nothing to insert')
          }

          const finding_with_qualifier = findingSExpression(
            task.s_expression,
            task.existence,
          )

          return patient_findings.insertOneIfNotAlreadyExistsForThisEncounter(
            trx,
            {
              patient_id,
              procedure_id,
              patient_encounter_id,
              patient_encounter_employee_id,
              finding: finding_with_qualifier,
            },
          )
        },
      )
    }
  },
)

export async function TriageAdditionalTasksAndInvestigationsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const task_groups = await getTasksGroups(ctx.state.trx, {
    health_worker_id: ctx.state.health_worker.id,
    encounter: ctx.state.encounter,
  })

  return (
    <AdditionalTasks
      task_groups={task_groups}
      organization_id={ctx.state.organization.id}
    />
  )
}

export default OpenEncounterWorkflowPage(
  TriageAdditionalTasksAndInvestigationsPage,
)
