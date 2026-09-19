import { z } from 'zod'
import type { OpenEncounterContext } from '../../../../../../../types.ts'
import { rules_dry_run } from '../../../../../../../db/models/rules_dry_run.ts'
import { sExpressionZodValidator } from '../../../../../../../shared/s_expression.ts'
import { insertable_finding_base } from '../../../../../../../shared/s_expression_schemas.ts'
import { assertOr400 } from '../../../../../../../util/assertOr.ts'
import { json } from '../../../../../../../util/responses.ts'

export const RulesDryRunSearchSchema = z.object({
  s_expression: sExpressionZodValidator(insertable_finding_base),
})

function parseSearchParams(search_params: URLSearchParams) {
  try {
    return RulesDryRunSearchSchema.parse(Object.fromEntries(search_params))
  } catch (error) {
    assertOr400(false, `Invalid s_expression: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/*
  GET ?s_expression=(clinical_finding ...)

  Responds with what the rules would do if that finding were recorded for this patient's
  open encounter: the check_for findings the health worker would be prompted for, the
  diagnoses it would indicate and the priority it would raise triage to. A dry run:
  nothing is written.
*/
export const handler = {
  async GET(ctx: OpenEncounterContext) {
    const { trx, patient_id, patient_encounter_id, patient_age_determination } = ctx.state

    assertOr400(patient_age_determination, "Complete the patient's registration before checking for findings, as tasks depend on their age")

    const { s_expression } = parseSearchParams(ctx.url.searchParams)
    assertOr400(s_expression.existence === 'Yes', 'Only a positive finding can be dry run')

    const dry_run = await rules_dry_run.forHypotheticalFinding(trx, {
      patient_id,
      patient_encounter_id,
      patient_age_determination,
      finding: s_expression,
    })

    return json(dry_run)
  },
}
