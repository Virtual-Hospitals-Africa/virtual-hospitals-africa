import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import WarningSigns from '../../../../../../../../islands/WarningSigns.tsx'
import entries from '../../../../../../../../util/entries.ts'
import { patient_findings } from '../../../../../../../../db/models/patient_findings.ts'
import { forEach } from '../../../../../../../../util/inParallel.ts'
import { inBackground } from '../../../../../../../../util/inBackground.ts'
import { KEYED_WARNING_SIGNS } from '../../../../../../../../shared/warning_signs.ts'
import { satisfyingSExpression } from '../../../../../../../../db/models/s_expression.ts'
import compact from '../../../../../../../../util/compact.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { parseFindingExpression } from '../../../../../../../../shared/s_expression.ts'

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
  (ctx: OpenEncounterWorkflowContext, form_values) => {
    const inserting_findings = forEach(
      form_values.warning_signs,
      ({ finding }) =>
        patient_findings.insertOneIfNotAlreadyExistsForThisEncounter(
          ctx.state.trx,
          {
            patient_id: ctx.state.patient.id,
            patient_encounter_id: ctx.state.encounter.patient_encounter_id,
            patient_encounter_employee_id: ctx.state.encounter_employee_presence
              .patient_encounter_employee_id,
            employment_id: ctx.state.encounter_employee_presence.employee_id,
            workflow_snomed_concept_id: ctx.state.workflow_snomed_concept_id,
            workflow_step_snomed_concept_id:
              ctx.state.workflow_step_snomed_concept_id,
            previously_completed_procedures:
              ctx.state.previously_completed_procedures,
            finding,
          },
        ),
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
  const patient_id = patient.id

  // Filter warning signs based on prompt_when_s_expression
  const filtered_warning_signs = await Promise.all(
    KEYED_WARNING_SIGNS.map(async (sign) => {
      const { prompt_when, clinical_finding } = await promiseProps({
        prompt_when: sign.prompt_when_s_expression
          ? satisfyingSExpression(trx, {
            patient_id,
            s_expression: sign.prompt_when_s_expression,
          })
          : Promise.resolve({ satisfies: true }),
        clinical_finding: satisfyingSExpression(trx, {
          patient_id,
          s_expression: sign.clinical_finding_s_expression,
        }),
      })

      if (!prompt_when.satisfies) {
        return null
      }

      return {
        ...sign,
        checked: clinical_finding.satisfies,
      }
    }),
  )

  console.log({ filtered_warning_signs })

  const warning_signs = compact(filtered_warning_signs)

  return <WarningSigns warning_signs={warning_signs} />
}

export default OpenEncounterWorkflowPage(TriageWarningSignsPage)
