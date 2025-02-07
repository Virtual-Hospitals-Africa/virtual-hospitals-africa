import { ExaminationContext, ExaminationPage } from './_middleware.tsx'
import {
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../../../../types.ts'
import * as examinations from '../../../../../../../db/models/examinations.ts'
import { parseRequest } from '../../../../../../../util/parseForm.ts'
import { getRequiredUUIDParam } from '../../../../../../../util/getParam.ts'
import redirect from '../../../../../../../util/redirect.ts'
import { z } from 'zod'
import { AddExaminationsForm } from '../../../../../../../islands/examinations/Add.tsx'
import { replaceParams } from '../../../../../../../util/replaceParams.ts'

const AddExaminationsSchema = z.object({
  examinations: z.string().array().default([]),
})

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  ExaminationContext['state']
> = {
  async POST(req: Request, ctx: ExaminationContext) {
    const { trx, encounter, encounter_provider } = ctx.state

    const form_values = await parseRequest(
      trx,
      req,
      AddExaminationsSchema.parse,
    )

    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    await examinations.createIncompleteIfNoneExists(trx, {
      patient_id,
      encounter_id: encounter.encounter_id,
      encounter_provider_id: encounter_provider.patient_encounter_provider_id,
      examination_identifiers: form_values.examinations,
    })

    return redirect(replaceParams(
      '/app/patients/:patient_id/encounters/:encounter_id/examinations',
      ctx.params,
    ))
  },
}

export default ExaminationPage(async function AddExaminationsPage(ctx) {
  const all_examinations = await examinations.allForStep(
    ctx.state.trx,
    { encounter_step: 'examinations' },
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
