import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import WarningSigns from '../../../../../../../../islands/WarningSigns.tsx'
import { parseFindingExpression } from '../../../../../../../../db/models/simple_record_language.ts'
import entries from '../../../../../../../../util/entries.ts'
import { insertOne } from '../../../../../../../../db/models/warning_signs.ts'
import { forEach } from '../../../../../../../../util/inParallel.ts'
import { inBackground } from '../../../../../../../../util/inBackground.ts'
import { WARNING_SIGNS } from '../../../../../../../../shared/warning_signs.ts'
import { satisfyingSExpression } from '../../../../../../../../db/models/s_expression.ts'

const WarningSignsSchema = z.object({
  warning_signs: z.record(
    z.string(),
    z.string().transform((value) => parseFindingExpression(value)),
  ).optional().default({}).transform((signs) =>
    entries(signs).map(([key, finding]) => ({
      key,
      finding,
    }))
  ),
})

export const handler = postHandler(
  WarningSignsSchema,
  (ctx: OpenEncounterWorkflowContext, form_values) => {
    const inserting_findings = forEach(
      form_values.warning_signs,
      ({ finding }) =>
        insertOne(ctx.state.trx, {
          patient_id: ctx.state.patient.id,
          patient_encounter_id: ctx.state.encounter.patient_encounter_id,
          patient_encounter_employee_id: ctx.state.encounter_employee_presence
            .patient_encounter_employee_id,
          workflow_snomed_concept_id: ctx.state.workflow_snomed_concept_id,
          workflow_step_snomed_concept_id:
            ctx.state.workflow_step_snomed_concept_id,
          previously_completed_procedures:
            ctx.state.previously_completed_procedures,
          finding,
        }),
    )

    return inBackground(
      inserting_findings,
      () => completeAndProceedToNextStep(ctx),
    )
  },
)

export async function TriageWarningSignsPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const { trx, patient } = ctx.state

  // Filter warning signs based on prompt_when_s_expression
  const filtered_warning_signs = await Promise.all(
    WARNING_SIGNS.map(async (sign) => {
      if (!sign.prompt_when_s_expression) {
        return sign
      }
      const { satisfies } = await satisfyingSExpression(trx, {
        patient_id: patient.id,
        s_expression: sign.prompt_when_s_expression,
      })
      return satisfies ? sign : null
    }),
  )

  const warning_signs = filtered_warning_signs.filter(
    (sign): sign is NonNullable<typeof sign> => sign !== null,
  )

  return <WarningSigns warning_signs={warning_signs} />
}

export default OpenEncounterWorkflowPage(TriageWarningSignsPage)
