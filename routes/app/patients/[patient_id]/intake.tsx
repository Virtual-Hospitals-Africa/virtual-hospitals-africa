import * as patients from '../../../../db/models/patients.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'
import { LoggedInHealthWorkerContext } from '../../../../types.ts'
import { getRequiredNumericParam } from '../../../../util/getNumericParam.ts'
import redirect from '../../../../util/redirect.ts'
import { INTAKE_STEPS } from '../../../../shared/intake.ts'
import { assert } from 'std/assert/assert.ts'

export default async function PatientPage(
  _req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  const { healthWorker } = ctx.state
  const patient_id = getRequiredNumericParam(ctx, 'patient_id')

  const [patient] = await patients.getWithOpenEncounter(ctx.state.trx, {
    ids: [patient_id],
    health_worker_id: healthWorker.id,
  })

  assertOr404(patient, 'Patient not found')

  if (!patient.completed_intake) {
    const first_incomplete_step = INTAKE_STEPS.find((step) =>
      !patient.intake_steps_completed.includes(step)
    )
    assert(first_incomplete_step)
    return redirect(
      `/app/patients/${patient_id}/intake/${first_incomplete_step}`,
    )
  }
  return redirect(`/app/patients/${patient_id}/intake/personal`)
}
