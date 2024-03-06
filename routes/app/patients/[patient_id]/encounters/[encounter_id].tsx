import { getRequiredNumericParam } from '../../../../../util/getNumericParam.ts'
import redirect from '../../../../../util/redirect.ts'
import { ENCOUNTER_STEPS } from '../../../../../shared/encounter.ts'
import { assert } from 'std/assert/assert.ts'
import {
  EncounterContext,
  getEncounterId,
} from './[encounter_id]/_middleware.tsx'

export default async function EncounterPage(
  _req: Request,
  ctx: EncounterContext,
) {
  const encounter_id = await getEncounterId(ctx)
  const patient_id = getRequiredNumericParam(ctx, 'patient_id')
  const { encounter } = ctx.state

  if (!encounter) {
    return redirect(
      `/app/patients/${patient_id}/?warning=No%20open%20encounter`,
    )
  }

  const first_incomplete_step = ENCOUNTER_STEPS.find((step) =>
    !encounter.steps_completed.includes(step)
  )

  if (first_incomplete_step) {
    return redirect(
      `/app/patients/${patient_id}/encounters/${encounter_id}/${first_incomplete_step}`,
    )
  }

  return redirect(
    `/app/patients/${patient_id}/ecounters/${encounter_id}/vitals`,
  )
}
