import { NurseRegistrationDetails, TrxOrDb } from '../../types.ts'

export function add(
  trx: TrxOrDb,
  opts: {
    registrationDetails: NurseRegistrationDetails
  },
) {
  return trx
    .insertInto('nurse_registration_details')
    .values(opts.registrationDetails)
    .execute()
}

export function getDetails(
  trx: TrxOrDb,
  opts: {
    healthWorkerId: number
  }
) {
  return trx
    .selectFrom('nurse_registration_details')
    .selectAll()
    .where('health_worker_id', '=', opts.healthWorkerId)
    .executeTakeFirst()
}
