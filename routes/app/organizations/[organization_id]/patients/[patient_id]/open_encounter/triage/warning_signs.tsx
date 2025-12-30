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

import { assert } from 'std/assert/assert.ts'
import isKeyOf from '../../../../../../../../util/isKeyOf.ts'
import { insertLevel } from '../../../../../../../../db/models/patient_triage.ts'
import {
  CheckedWarningSign,
  KeyedWarningSign,
} from '../../../../../../../../types.ts'
import { groupByUniq } from '../../../../../../../../util/groupBy.ts'
import { exists } from '../../../../../../../../util/exists.ts'
import { markEnteredInError } from '../../../../../../../../db/models/patient_records.ts'
import keys from '../../../../../../../../util/keys.ts'
import { parseExpressionExpectingAtom } from '../../../../../../../../shared/s_expression.ts'

const WarningSignsSchema = z.object({
  warning_signs: z.partialRecord(
    z.enum(keys(WARNING_SIGNS)),
    z.string().transform((
      value,
    ) => parseExpressionExpectingAtom(value, 'finding')),
  ).default({}).transform((signs) =>
    entries(signs).map(([key, finding]) => ({
      key,
      finding: exists(finding),
    }))
  ),
}).strict()

export const handler = postHandler(
  WarningSignsSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const {
      trx,
      patient_id,
      patient_encounter_id,
      encounter_employee_presence,
    } = ctx.state
    const warning_signs_previously_entered = groupByUniq(
      await getWarningSignsFromThisEncounter(ctx),
      (sign) => sign.key,
    )

    const { procedure_id } = await createProcedureIfNotAlreadyCompleted(ctx)
    assert(procedure_id)

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
            trx,
            {
              patient_id,
              patient_encounter_id,
              patient_encounter_employee_id: encounter_employee_presence
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
          trx,
          {
            patient_id,
            patient_encounter_id,
            procedure_id,
            by_system: true,
            triage_level: sign.sats_priority,
            evaluates_record_id: finding_insert.finding_id,
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
          patient_id,
          patient_encounter_id,
          procedure_id,
          employment_id: ctx.state.encounter_employee_presence.employee_id,
          altered_record_id: exists(record.satisfied_by_record_id),
        },
      )
    }

    return completeAndProceedToNextStep(ctx)
  },
)

function getWarningSignsFromThisEncounter(
  ctx: OpenEncounterWorkflowContext,
): Promise<CheckedWarningSign[]> {
  const {
    trx,
    patient_id,
    patient_encounter_id,
    previously_completed_procedures: { workflow_step_record_id },
  } = ctx.state

  function promptWhen({ prompt_when_s_expression }: KeyedWarningSign) {
    if (!prompt_when_s_expression) {
      return Promise.resolve({ satisfies: true })
    }
    return satisfyingSExpression(trx, {
      patient_id,
      s_expression: prompt_when_s_expression,
    })
  }

  function clinicalFinding(
    { excluding_s_expression, clinical_finding_s_expression }: KeyedWarningSign,
  ) {
    if (!workflow_step_record_id) {
      return Promise.resolve({ satisfies: false, record_ids: [] })
    }
    const s_expression = excluding_s_expression
      ? `(and ${clinical_finding_s_expression}
            (not ${excluding_s_expression}))
      `
      : clinical_finding_s_expression

    return satisfyingSExpression(trx, {
      patient_id,
      patient_encounter_id,
      s_expression,
      procedure_id: workflow_step_record_id,
    })
  }

  return Promise.all(
    KEYED_WARNING_SIGNS.map(async (sign) => {
      const { prompt_when, clinical_finding } = await promiseProps({
        prompt_when: promptWhen(sign),
        clinical_finding: clinicalFinding(sign),
      })
      return prompt_when.satisfies && {
        ...sign,
        satisfied_by_record_id: clinical_finding.record_ids[0] || null,
      }
    }),
  ).then(compact)
}

export async function TriageWarningSignsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  return (
    <WarningSigns warning_signs={await getWarningSignsFromThisEncounter(ctx)} />
  )
}

export default OpenEncounterWorkflowPage(TriageWarningSignsPage)
