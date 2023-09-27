import {
  HealthWorkerInvitee,
  HealthWorkerWithGoogleTokens,
  TrxOrDb,
} from '../types.ts'
import { addEmployee } from '../db/models/health_workers.ts'
import { assert } from 'std/assert/assert.ts'

export async function addToEmploymentTable(
  trx: TrxOrDb,
  healthWorker: HealthWorkerWithGoogleTokens,
  invite: HealthWorkerInvitee,
) {
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
