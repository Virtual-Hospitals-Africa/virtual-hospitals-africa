import * as patients from '../../../../db/models/patients.ts'
import type { LoggedInHealthWorkerContext } from '../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'
import redirect from '../../../../util/redirect.ts'
import type { FreshContext } from '$fresh/server.ts'

export type PatientContext = LoggedInHealthWorkerContext<
{
  patient: {
    id: string
    name: string
  }
}
>

export async function handler(
  _req: Request,
  ctx: PatientContext,
) {
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
  
  // TODO check that health worker has access to patient
  const patient = await patients.getByID(ctx.state.trx, {
    id: patient_id,
  })

  assertOr404(patient, 'Patient not found')

  // Bug is here
  if (!patient.completed_intake && !ctx.url.pathname.includes('/intake')) {
    return redirect(`/app/patients/${patient_id}/intake`)
  }

  ctx.state.patient = patient
  return ctx.next()
}

export function postHandler(
  _req: Request,
  ctx: FreshContext
) {
  return ctx.next()
}
