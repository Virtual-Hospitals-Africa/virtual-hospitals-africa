import { patients } from '../../../../db/models/patients.ts'
import type { LoggedInHealthWorkerContext, RenderedPatient } from '../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'

export type PatientContext = LoggedInHealthWorkerContext<
  {
    patient: RenderedPatient
  }
>

export async function handler(
  ctx: PatientContext,
) {
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
  const patient = await patients.getById(ctx.state.trx, patient_id)
  ctx.state.patient = patient
  return ctx.next()
}
