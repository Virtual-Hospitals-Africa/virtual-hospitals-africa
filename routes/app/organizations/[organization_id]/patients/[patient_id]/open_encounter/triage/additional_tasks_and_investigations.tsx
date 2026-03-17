import { completeAndProceedToNextStep, completedProcedure, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import AdditionalTasks from '../../../../../../../../components/triage/AdditionalTasks.tsx'
import { additional_tasks } from '../../../../../../../../db/models/additional_tasks.ts'
import { positive_decimal, yes_no_unknown } from '../../../../../../../../util/validators.ts'
import { sExpressionZodValidator } from '../../../../../../../../shared/s_expression.ts'
import { FindingNodeToInsert, MeasurementToInsert, patient_findings } from '../../../../../../../../db/models/patient_findings.ts'

import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { insertable_finding_base, investigation, measurement } from '../../../../../../../../shared/s_expression_schemas.ts'
import { events } from '../../../../../../../../db/models/events.ts'
import values from '../../../../../../../../util/values.ts'
import { assert } from 'std/assert/assert.ts'
import { markEnteredInError } from '../../../../../../../../db/models/patient_records_base.ts'
import { NO_QUALIFIER, UNKNOWN_QUALIFIER } from '../../../../../../../../shared/snomed_concepts.ts'
import compactMap from '../../../../../../../../util/compactMap.ts'
import zip from '../../../../../../../../util/zip.ts'
import { exists } from '../../../../../../../../util/exists.ts'
import { logJSONToFileIfOnServer } from '../../../../../../../../util/logJSONToFileIfOnServer.ts'

export const TriageAdditionalTasksAndInvestigationsSchema = z.object({
  evaluation_ids: z.string().uuid().array(),
  just_do_it_tasks: z.record(
    z.string(),
    z.object({
      s_expression: sExpressionZodValidator(investigation),
    }),
  ).optional().default({}).transform(values),
  check_for: z.record(
    z.string(),
    z.object({
      s_expression: sExpressionZodValidator(insertable_finding_base),
      existence: yes_no_unknown,
      existing_finding: z.object({
        id: z.string().uuid(),
        existence: yes_no_unknown,
      }).optional(),
    }),
  ).optional().default({}).transform(values),
  measurements: z.record(
    z.string(),
    z.object({
      s_expression: sExpressionZodValidator(measurement),
      value: positive_decimal,
      units: z.string().min(1),
      existing_measurement: z.object({
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
  records: { id: string; existence: 'Yes' | 'No' | 'Unknown' }[]
} | typeof NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges

export const handler = postHandler(
  TriageAdditionalTasksAndInvestigationsSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const {
      trx,
      health_worker_id,
      encounter,
      employment_id,
      workflow,
      step,
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
      task_groups: additional_tasks.getTasksGroups(trx, { health_worker_id, encounter }),
      inserted: markAlteredRecords().then(() => insertFindings()),
    })

    await promiseProps({
      _: inserted === NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges ? Promise.resolve() : additional_tasks.procedureCompletedTasks(trx, {
        patient_id,
        patient_encounter_id,
        procedure_id: inserted.procedure_id,
        evaluation_ids: form_values.evaluation_ids,
      }),
      dispatched: dispatchEvent(inserted),
    })

    return response

    async function insertFindings(): Promise<InsertedSummary> {
      const findings_to_insert: FindingNodeToInsert[] = compactMap(form_values.check_for, (finding) => {
        if (finding.existing_finding && finding.existing_finding.existence === finding.existence) return
        return {
          ...finding.s_expression,
          existence: finding.existence,
          value_snomed_concept: finding.existence === 'Yes' ? null : finding.existence === 'No'
            ? {
              atom: 'snomed_concept',
              ...NO_QUALIFIER,
            }
            : {
              atom: 'snomed_concept',
              ...UNKNOWN_QUALIFIER,
            },
        }
      })

      const measurements_to_insert: MeasurementToInsert[] = compactMap(form_values.measurements, (measurement) => {
        if (measurement.existing_measurement && measurement.existing_measurement.value.equals(measurement.value)) return
        return {
          atom: '=' as const,
          type: 'measurement' as const,
          measurement: measurement.s_expression,
          value: measurement.value,
        }
      })

      if (!findings_to_insert.length) {
        return NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges
      }

      const { success, procedure_id, finding_ids, measurement_ids } = await patient_findings.insertMany(
        trx,
        {
          patient_id,
          employment_id,
          patient_encounter_id,
          patient_encounter_employee_id,
          findings: findings_to_insert,
          measurements: measurements_to_insert,
          procedure: completed_procedure || {
            create_with_specific_snomed_concept_id: exists(workflow_step_snomed_concept?.id),
          },
        },
      )
      assert(success)
      assert(procedure_id)

      const finding_records = Array.from(
        zip(finding_ids, findings_to_insert).map(([id, { existence }]) => ({
          id,
          existence,
        })),
      )

      const measurement_records = measurement_ids.map((id) => ({
        id,
        existence: 'Yes' as const,
      }))

      return { procedure_id, records: [...finding_records, ...measurement_records] }
    }

    function dispatchEvent(
      inserted: InsertedSummary,
    ) {
      if (inserted === NoInsertOnAccountOfPreviouslyCompletedProcedureWithNoChanges) return
      return events.insert(trx, {
        type: 'ProcedureCompleted',
        data: {
          workflow,
          step,
          patient_id,
          patient_encounter_id,
          patient_age_determination,
          ...inserted,
        },
      })
    }

    function markAlteredRecords() {
      if (!completed_procedure) return Promise.resolve()
      const altered_record_ids = compactMap(
        form_values.check_for,
        ({ existence, existing_finding }) => (existing_finding && existing_finding.existence != existence) && existing_finding.id,
      )

      return markEnteredInError(trx, {
        patient_id,
        employment_id,
        patient_encounter_id,
        altered_record_ids,
        procedure_id: completed_procedure.procedure_id,
      })
    }
  },
)

export async function TriageAdditionalTasksAndInvestigationsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { trx, encounter, health_worker_id, organization_id, patient_encounter_id } = ctx.state
  await events.allProcessedForEncounter(trx, { patient_encounter_id })
  const { evaluation_ids, task_groups } = await additional_tasks.getTasksGroups(trx, { health_worker_id, encounter })

  logJSONToFileIfOnServer(task_groups)

  const use_pdf_viewer = ctx.req.headers.get('X-Requested-With') !== null

  return (
    <AdditionalTasks
      organization_id={organization_id}
      evaluation_ids={evaluation_ids}
      task_groups={task_groups}
      use_pdf_viewer={use_pdf_viewer}
    />
  )
}

export default OpenEncounterWorkflowPage(
  TriageAdditionalTasksAndInvestigationsPage,
)
