import * as patients from '../../../../db/models/patients.ts'
import type {
  HasStringId,
  LoggedInHealthWorkerContext,
  PatientWithOpenEncounter,
} from '../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'
import type { FreshContext } from '$fresh/server.ts'

export type PatientContext = LoggedInHealthWorkerContext<
  {
    patient: HasStringId<PatientWithOpenEncounter>
  }
>

export async function handler(
  _req: Request,
  ctx: PatientContext,
) {
  const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

  const [patient] = await patients.getWithOpenEncounter(ctx.state.trx, {
    ids: [patient_id],
    health_worker_id: ctx.state.healthWorker.id,
  })

  assertOr404(patient, 'Patient not found')

  ctx.state.patient = patient
  return ctx.next()
}

export function postHandler(
  _req: Request,
  ctx: FreshContext,
) {
  return ctx.next()
}
