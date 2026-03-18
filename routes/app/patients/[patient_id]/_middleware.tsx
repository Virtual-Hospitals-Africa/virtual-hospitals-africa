import { timeMiddlewareCallNext } from '../../../../backend/timeMiddleware.ts'
import { patients } from '../../../../db/models/patients.ts'
import type { LoggedInHealthWorkerContext, RenderedPatient } from '../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'

export type PatientContext = LoggedInHealthWorkerContext<
  {
    patient: RenderedPatient
  }
>

export const handler = timeMiddlewareCallNext(
  async function attachPatient(
    ctx: PatientContext,
  ) {
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
    const patient = await patients.getById(ctx.state.trx, patient_id, { include_incomplete_registration: true })
    ctx.state.patient = patient
  },
)
