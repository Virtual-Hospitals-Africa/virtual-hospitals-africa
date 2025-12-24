import {
  completeAndProceedToNextStep,
  createProcedureIfNotAlreadyCompleted,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import WarningSigns from '../../../../../../../../islands/WarningSigns.tsx'
import entries from '../../../../../../../../util/entries.ts'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { forEach } from '../../../../../../../../util/inParallel.ts'
import {
  KEYED_WARNING_SIGNS,
  WARNING_SIGNS,
} from '../../../../../../../../shared/warning_signs.ts'
import { satisfyingSExpression } from '../../../../../../../../db/models/s_expression.ts'
import compact from '../../../../../../../../util/compact.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import {
  parseFindingExpression,
} from '../../../../../../../../shared/s_expression.ts'
import { assert } from 'std/assert/assert.ts'
import isKeyOf from '../../../../../../../../util/isKeyOf.ts'
import { insertLevel } from '../../../../../../../../db/models/patient_triage.ts'
import { CheckedWarningSign } from '../../../../../../../../types.ts'
import { groupByUniq } from '../../../../../../../../util/groupBy.ts'
import { exists } from '../../../../../../../../util/exists.ts'
import { markEnteredInError } from '../../../../../../../../db/models/patient_records.ts'

const WarningSignsSchema = z.object({
  warning_signs: z.record(
    z.string(),
    z.string().transform((
      value,
    ) => parseFindingExpression(value)),
  ).optional().default({}).transform((signs) =>
    entries(signs).map(([key, finding]) => ({
      key,
      finding,
    }))
  ),
}).strict()

export const handler = postHandler(
  WarningSignsSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const warning_signs_previously_entered = groupByUniq(
      await getWarningSignsFromThisEncounter(ctx),
      (sign) => sign.key,
    )

    const { procedure_id } = await createProcedureIfNotAlreadyCompleted(ctx)
    assert(procedure_id)

    if (!form_values.warning_signs.length) {
      await insertLevel(
        ctx.state.trx,
        {
          patient_id: ctx.state.patient.id,
          patient_encounter_id: ctx.state.encounter.patient_encounter_id,
          employment_id: ctx.state.encounter_employee_presence.employee_id,
          procedure_id,
          evaluates_record_id: procedure_id,
          triage_level: 'Non-urgent',
        },
      )
    }

    await forEach(
      form_values.warning_signs,
      async ({ key, finding }) => {
        const previously_entered = exists(
          warning_signs_previously_entered.get(key),
        )
        warning_signs_previously_entered.delete(key)

        if (previously_entered.satisfied_by_record_id) return

        const finding_insert = await patient_findings
          .insertOneIfNotAlreadyExistsForThisEncounter(
            ctx.state.trx,
            {
              patient_id: ctx.state.patient.id,
              patient_encounter_id: ctx.state.encounter.patient_encounter_id,
              patient_encounter_employee_id:
                ctx.state.encounter_employee_presence
                  .patient_encounter_employee_id,
              procedure_id,
              finding,
            },
          )
        assert(finding_insert.success)
        assert(finding_insert.inserted_new)
        assert(isKeyOf(key, WARNING_SIGNS))
        const sign = WARNING_SIGNS[key]

        await insertLevel(
          ctx.state.trx,
          {
            patient_id: ctx.state.patient.id,
            patient_encounter_id: ctx.state.encounter.patient_encounter_id,
            employment_id: ctx.state.encounter_employee_presence.employee_id,
            procedure_id,
            evaluates_record_id: finding_insert.record_id,
            triage_level: sign.sats_priority,
          },
        )
      },
    )

    const now_invalid = Array.from(warning_signs_previously_entered.values())
      .filter((record) => record.satisfied_by_record_id)

    for (const record of now_invalid) {
      await markEnteredInError(
        ctx.state.trx,
        {
          patient_id: ctx.state.patient.id,
          patient_encounter_id: ctx.state.encounter.patient_encounter_id,
          employment_id: ctx.state.encounter_employee_presence.employee_id,
          procedure_id,
          altered_record_id: exists(record.satisfied_by_record_id),
        },
      )
    }

    return completeAndProceedToNextStep(ctx)
  },
)

async function getWarningSignsFromThisEncounter(
  ctx: OpenEncounterWorkflowContext,
): Promise<CheckedWarningSign[]> {
  const { trx, patient, encounter, previously_completed_procedures } = ctx.state
  const { patient_encounter_id } = encounter
  const patient_id = patient.id

  return compact(
    await Promise.all(
      KEYED_WARNING_SIGNS.map(async (sign) => {
        const { prompt_when, clinical_finding } = await promiseProps({
          prompt_when: sign.prompt_when_s_expression
            ? satisfyingSExpression(trx, {
              patient_id,
              s_expression: sign.prompt_when_s_expression,
            })
            : Promise.resolve({ satisfies: true }),
          clinical_finding:
            !previously_completed_procedures.workflow_step_record_id
              ? Promise.resolve({ satisfies: false, record_ids: [] })
              : satisfyingSExpression(trx, {
                patient_id,
                patient_encounter_id,
                procedure_id:
                  previously_completed_procedures.workflow_step_record_id,
                s_expression: sign.clinical_finding_s_expression,
              }),
        })

        console.log({ sign, prompt_when, clinical_finding })

        if (!prompt_when.satisfies) {
          return null
        }

        return {
          ...sign,
          satisfied_by_record_id: clinical_finding.record_ids[0] || null,
        }
      }),
    ),
  )
}

export async function TriageWarningSignsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  console.log({
    w: await getWarningSignsFromThisEncounter(ctx),
  })
  return (
    <WarningSigns warning_signs={await getWarningSignsFromThisEncounter(ctx)} />
  )
}

export default OpenEncounterWorkflowPage(TriageWarningSignsPage)
