import { getCookies } from 'std/http/cookie.ts'
import { assertAllPriorStepsCompleted, completeAndProceedToNextStep, completedProcedure } from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import AdditionalTasks from '../../../../../../../../components/triage/AdditionalTasks.tsx'
import { additional_tasks } from '../../../../../../../../db/models/additional_tasks.ts'
import { positive_decimal } from '../../../../../../../../util/validators.ts'
import { sExpressionZodValidator } from '../../../../../../../../shared/s_expression.ts'
import { FindingNodeToInsert, InsertedRecord, MeasurementToInsert, patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { measurement, to_be_done } from '../../../../../../../../shared/s_expression_schemas.ts'
import { events } from '../../../../../../../../db/models/events.ts'
import values from '../../../../../../../../util/values.ts'
import { assert } from 'std/assert/assert.ts'
import compactMap from '../../../../../../../../util/compactMap.ts'
import { exists } from '../../../../../../../../util/exists.ts'
import uniq from '../../../../../../../../util/uniq.ts'
import { task_description_validator } from '../../../../../../../../shared/tasks.ts'
import type { TriageContext } from '../../../../../../../../types.ts'
import { redirectToRoutePatientIfEmergency, TriagePage } from './_middleware.tsx'

/*
  check_for tasks are not submitted with the page: their findings are recorded as they are
  answered through the clinical_finding and none_of_the_above_findings routes, which mark the
  tasks done. Measurements are submitted here, each naming its task so that it can be marked done.
*/
export const TriageAdditionalTasksAndInvestigationsSchema = z.object({
  just_do_it_tasks: z.record(
    z.string(),
    z.object({
      s_expression: sExpressionZodValidator(to_be_done),
    }),
  ).optional().default({}).transform(values),
  measurements: z.record(
    z.string(),
    z.object({
      task_description: task_description_validator,
      s_expression: sExpressionZodValidator(measurement),
      value: positive_decimal,
      units: z.string().min(1),
      existing_record: z.object({
        id: z.string().uuid(),
        value: positive_decimal,
      }).optional(),
    }),
  ).optional().default({}).transform(values),
})

const NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges = Symbol(
  'NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges',
)

type InsertedSummary = {
  procedure_id: string
  records: InsertedRecord[]
} | typeof NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges

export const handler = postHandler(
  TriageAdditionalTasksAndInvestigationsSchema,
  async (ctx: TriageContext, form_values) => {
    const {
      trx,
      employment_id,
      patient_age_determination,
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      workflow_step_snomed_concept,
    } = ctx.state

    assert(patient_age_determination)
    const completed_procedure = completedProcedure(ctx)

    const { response, inserted } = await promiseProps({
      response: completeAndProceedToNextStep(ctx),
      inserted: insertFindings(),
    })

    /*
      The DONE relations record that this procedure answered the measurement tasks on the page.
      Nothing downstream relies on them, so FindingsAdded is dispatched alongside rather than after.
    */
    await promiseProps({
      marked_done: markMeasurementTasksDone(inserted),
      dispatched: dispatchEvent(inserted),
    })

    return response

    async function insertFindings(): Promise<InsertedSummary> {
      const findings_to_insert: FindingNodeToInsert[] = []

      const measurements_to_insert: MeasurementToInsert[] = compactMap(form_values.measurements, (measurement) => {
        if (measurement.existing_record && measurement.existing_record.value.equals(measurement.value)) return
        return {
          atom: '=' as const,
          type: 'measurement' as const,
          measurement: measurement.s_expression,
          value: measurement.value,
        }
      })

      if (!findings_to_insert.length && !measurements_to_insert.length) {
        return NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges
      }

      const { success, procedure_id, findings, measurements } = await patient_findings.insertMany(
        trx,
        {
          patient_id,
          employment_id,
          patient_encounter_id,
          patient_encounter_employee_id,
          patient_age_determination: exists(patient_age_determination),
          findings: findings_to_insert,
          measurements: measurements_to_insert,
          procedure: completed_procedure || {
            create_with_specific_snomed_concept_id: exists(workflow_step_snomed_concept?.id),
          },
        },
      )
      assert(success)
      assert(procedure_id)

      return { procedure_id, records: [...findings, ...measurements] }
    }

    function dispatchEvent(
      inserted: InsertedSummary,
    ) {
      if (inserted === NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges) return
      return events.insert(trx, {
        type: 'FindingsAdded',
        data: {
          patient_id,
          patient_encounter_id,
          patient_age_determination,
          ...inserted,
        },
      })
    }

    // Each measurement task submitted is marked done by the page's procedure, as the tasks
    // answered from the follow ups panel are by none_of_the_above_findings
    async function markMeasurementTasksDone(inserted: InsertedSummary) {
      const procedure_id = inserted === NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges ? completed_procedure?.procedure_id : inserted.procedure_id
      if (!procedure_id) return
      for (const task_description of uniq(form_values.measurements.map((measurement) => measurement.task_description))) {
        await additional_tasks.markTaskDone(trx, { patient_id, patient_encounter_id, procedure_id, task_description })
      }
    }
  },
)

export function TriageAdditionalTasksAndInvestigationsPage(
  ctx: TriageContext,
) {
  redirectToRoutePatientIfEmergency(ctx)
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })
  const { task_groups, check_for_follow_ups, organization_id, open_encounter_pathname } = ctx.state

  const use_pdf_viewer = getCookies(ctx.req.headers)['twa'] === '1'

  // The check_for tasks are shown in the page rather than the follow ups panel
  return {
    check_for_in_page: true as const,
    children: (
      <AdditionalTasks
        organization_id={organization_id}
        task_groups={task_groups}
        check_for_follow_ups={check_for_follow_ups}
        none_of_the_above_findings_route={`${open_encounter_pathname}/none_of_the_above_findings`}
        use_pdf_viewer={use_pdf_viewer}
      />
    ),
  }
}

export default TriagePage(
  TriageAdditionalTasksAndInvestigationsPage,
)
