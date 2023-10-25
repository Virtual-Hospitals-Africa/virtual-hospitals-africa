import {
  NurseRegistrationDetails,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import { assert } from 'std/assert/assert.ts'

export function add(
  trx: TrxOrDb,
  opts: {
    registrationDetails: NurseRegistrationDetails
  },
) {
  assert(
    inputValidation(opts.registrationDetails),
    'failed at input validation',
  )
  return trx
    .insertInto('nurse_registration_details')
    .values(opts.registrationDetails)
    .execute()
}

export function get(
  trx: TrxOrDb,
  opts: {
    healthWorkerId: number
  },
): Promise<ReturnedSqlRow<NurseRegistrationDetails> | undefined> {
  return trx
    .selectFrom('nurse_registration_details')
    .selectAll()
    .where('health_worker_id', '=', opts.healthWorkerId)
    .executeTakeFirst()
}

export function approve(
  trx: TrxOrDb,
  opts: {
    approverId: number
    healthWorkerId: number
  },
) {
  return trx
    .updateTable('nurse_registration_details')
    .set({
      approved_by: opts.approverId,
    })
    .where('approved_by', 'is', null)
    .where('health_worker_id', '=', opts.healthWorkerId)
    .returningAll()
    .executeTakeFirst()
}

function inputValidation(registrationDetails: NurseRegistrationDetails) {
  return typeof registrationDetails.health_worker_id === 'number' &&
    (registrationDetails.gender === 'male' ||
      registrationDetails.gender === 'female' ||
      registrationDetails.gender === 'other') &&
    /^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$/.test(
      registrationDetails.national_id_number,
    ) &&
    isDate(registrationDetails.date_of_birth) &&
    isDate(registrationDetails.date_of_first_practice) &&
    /^[a-zA-Z]{2}[0-9]{6}$/.test(registrationDetails.ncz_registration_number) &&
    /^[0-9]+$/.test(registrationDetails.mobile_number) &&
    (registrationDetails.national_id_media_id == null ||
      typeof registrationDetails.national_id_media_id === 'number') &&
    (registrationDetails.ncz_registration_card_media_id == null ||
      typeof registrationDetails.ncz_registration_card_media_id === 'number') &&
    (registrationDetails.face_picture_media_id == null ||
      typeof registrationDetails.face_picture_media_id === 'number') &&
    (registrationDetails.approved_by == null ||
      typeof registrationDetails.approved_by === 'number')
}

function isDate(date: string): boolean {
  return /^[0-9]{4}[-][0-9]{2}[-][0-9]{2}$/.test(date)
}
