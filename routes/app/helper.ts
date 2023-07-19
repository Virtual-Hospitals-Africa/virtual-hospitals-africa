import { HealthWorkerInvitee, HealthWorkerWithGoogleTokens, TrxOrDb } from '../../types.ts'
import { addEmployee } from '../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'

export async function addToHealthWorkerAndEmploymentTable(
  trx: TrxOrDb,
  healthWorker: HealthWorkerWithGoogleTokens,
  invite: HealthWorkerInvitee,
) {
  //TODO: check whether the healthworker already exists, and just add to employmnet table if so
  /*
  assert(
    await upsert(trx, {
      name: healthWorker.name,
      email: healthWorker.email,
      avatar_url: healthWorker.avatar_url,
      gcal_appointments_calendar_id: healthWorker.gcal_appointments_calendar_id,
      gcal_availability_calendar_id: healthWorker.gcal_availability_calendar_id,
    }),
  )
  */

  assert(
    await addEmployee(trx, {
      employee: {
        health_worker_id: healthWorker.id,
        profession: invite.profession,
        facility_id: invite.facility_id,
      },
    }),
  )
}