import * as patients from '../../../../db/models/patients.ts'
import * as patient_encounters from '../../../../db/models/patient_encounters.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'
import { LoggedInHealthWorkerContext } from '../../../../types.ts'
import { getRequiredNumericParam } from '../../../../util/getNumericParam.ts'
import redirect from '../../../../util/redirect.ts'
import { INTAKE_STEPS } from '../../../../shared/intake.ts'
import { ENCOUNTER_STEPS } from '../../../../shared/encounter.ts'
import { assert } from 'std/assert/assert.ts'
import { EncounterContext } from './encounters/[encounter_id]/_middleware.tsx'

export default async function EncounterPage(
  _req: Request,
  ctx: EncounterContext,
) {
  const patient_id = getRequiredNumericParam(ctx, 'patient_id')
  const healthWorker = ctx.state.healthWorker

  const [patient] = await patients.getWithOpenEncounter(ctx.state.trx, {
    ids: [patient_id],
    health_worker_id: healthWorker.id,
  })

  if (!patient.completed_intake) {
    return redirect(`/app/patients/${patient_id}`)
  }

  const encounter = await patient_encounters.getOpen(ctx.state.trx, patient_id)
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
      `/app/patients/${patient_id}/encounters/${encounter.encounter_id}/${first_incomplete_step}`,
    )
  }

  return redirect(`/app/patients/${patient_id}/ecounters/vitals`)
}
