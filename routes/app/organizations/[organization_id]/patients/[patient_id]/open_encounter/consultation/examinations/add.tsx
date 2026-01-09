import { ExaminationContext, ExaminationPage } from './_middleware.tsx'
import {} from '../../../../../../../../../types.ts'
import * as examinations from '../../../../../../../../../db/models/examinations.ts'
import { parseRequest } from '../../../../../../../../../backend/parseForm.ts'
import { getRequiredUUIDParam } from '../../../../../../../../../util/getParam.ts'
import redirect from '../../../../../../../../../util/redirect.ts'
import { z } from 'zod'
import { AddExaminationsForm } from '../../../../../../../../../islands/examinations/Add.tsx'
import { replaceParams } from '../../../../../../../../../util/replaceParams.ts'

const AddExaminationsSchema = z.object({
  examinations: z.string().array().default([]),
})

export const handler = {
  async POST(ctx: ExaminationContext) {
    const req = ctx.req
    const { trx, encounter, encounter_employee_presence } = ctx.state

    const form_values = await parseRequest(
      req,
      AddExaminationsSchema.parse,
    )

    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    await examinations.createIncompleteIfNoneExists(trx, {
      patient_id,
      patient_encounter_id: encounter.patient_encounter_id,
      patient_encounter_employee_id:
        encounter_employee_presence.patient_encounter_employee_id,
      examination_identifiers: form_values.examinations,
    })

    return redirect(replaceParams(
      '/app/patients/:patient_id/encounters/:patient_encounter_id/examinations',
      ctx.params,
    ))
  },
}

export default ExaminationPage(async function AddExaminationsPage(ctx) {
  const all_examinations = await examinations.allForStep(
    ctx.state.trx,
    { consultation_step: 'examinations' },
  )

  return (
    <AddExaminationsForm
      selected_examinations={ctx.state.patient_examinations.map((ex) =>
        ex.examination_identifier
      )}
      all_examinations={all_examinations}
    />
  )
})
