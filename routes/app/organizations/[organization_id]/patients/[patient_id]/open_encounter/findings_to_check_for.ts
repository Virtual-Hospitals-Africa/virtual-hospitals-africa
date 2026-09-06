import { z } from 'zod'
import type { OpenEncounterContext } from '../../../../../../../types.ts'
import { findings_to_check_for } from '../../../../../../../db/models/findings_to_check_for.ts'
import { sExpressionZodValidator } from '../../../../../../../shared/s_expression.ts'
import { insertable_finding_base } from '../../../../../../../shared/s_expression_schemas.ts'
import { assertOr400 } from '../../../../../../../util/assertOr.ts'
import { json } from '../../../../../../../util/responses.ts'

export const FindingsToCheckForSearchSchema = z.object({
  s_expression: sExpressionZodValidator(insertable_finding_base),
})

function parseSearchParams(search_params: URLSearchParams) {
  try {
    return FindingsToCheckForSearchSchema.parse(Object.fromEntries(search_params))
  } catch (error) {
    assertOr400(false, `Invalid s_expression: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/*
  GET ?s_expression=(clinical_finding ...)

  Responds with the check_for findings the health worker would be prompted for if that
  finding were recorded for this patient's open encounter. A dry run: nothing is written.
*/
export const handler = {
  async GET(ctx: OpenEncounterContext) {
    const { trx, patient_id, patient_encounter_id, patient_age_determination } = ctx.state

    assertOr400(patient_age_determination, "Complete the patient's registration before checking for findings, as tasks depend on their age")

    const { s_expression } = parseSearchParams(ctx.url.searchParams)

    const result = await findings_to_check_for.forHypotheticalFinding(trx, {
      patient_id,
      patient_encounter_id,
      patient_age_determination,
      finding: s_expression,
    })

    return json({ findings_to_check_for: result })
  },
}
