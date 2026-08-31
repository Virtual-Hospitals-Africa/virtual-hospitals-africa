import { z } from 'zod'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import { patient_findings } from '../../../../../../../db/models/patient_findings.ts'
import { ADMINISTRATIVE_PROCEDURE } from '../../../../../../../shared/snomed_concepts.ts'
import { OpenEncounterContext } from '../../../../../../../types.ts'
import { assertOr400 } from '../../../../../../../util/assertOr.ts'
import { exists } from '../../../../../../../util/exists.ts'
import redirect from '../../../../../../../util/redirect.ts'
import { success } from '../../../../../../../util/alerts.ts'
import AdHocFindings from '../../../../../../../islands/AdHocFindings.tsx'
import { stripComments } from '../../../../../../../s_expression/compile.ts'

function splitTopLevelExpressions(text: string): string[] {
  const expressions: string[] = []
  let depth = 0
  let start = -1
  let in_string = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (in_string) {
      if (ch === '"') in_string = false
      continue
    }
    if (ch === '"') {
      in_string = true
      continue
    }
    if (ch === '(') {
      if (depth === 0) start = i
      depth++
    } else if (ch === ')') {
      depth--
      if (depth === 0 && start !== -1) {
        expressions.push(text.slice(start, i + 1))
        start = -1
      }
    }
  }

  return expressions
}

const AdHocFindingsSchema = z.object({
  findings_text: z.string(),
})

export const handler = postHandler(
  AdHocFindingsSchema,
  async (ctx: OpenEncounterContext, { findings_text }) => {
    const { trx, patient_id, patient_encounter_id, employment_id, encounter_employee_presence } = ctx.state
    assertOr400(encounter_employee_presence, 'You must be present with the patient to submit findings')
    const { patient_encounter_employee_id } = encounter_employee_presence

    const stripped = stripComments(findings_text)
    const findings = splitTopLevelExpressions(stripped)
    assertOr400(findings.length > 0, 'No findings found in the submitted text')

    await patient_findings.insertMany(trx, {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      employment_id,
      procedure: {
        create_with_specific_snomed_concept_id: exists(ADMINISTRATIVE_PROCEDURE.id),
      },
      findings,
    })

    return redirect(success(`Inserted ${findings.length} finding${findings.length === 1 ? '' : 's'}`, ctx.url.pathname))
  },
)

export default function AdHocPage() {
  return (
    <div class='p-6 max-w-5xl mx-auto'>
      <h1 class='text-2xl font-semibold mb-1'>Ad Hoc Findings</h1>
      <p class='text-gray-600 mb-4'>
        Enter s-expression findings, one per top-level expression.
      </p>
      <AdHocFindings />
    </div>
  )
}
