import {
  NurseRegistrationDetails,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import { assert } from 'std/testing/asserts.ts'

export function add(
  trx: TrxOrDb,
  opts: {
    registrationDetails: NurseRegistrationDetails
  },
) {
  assert(inputValidation(opts.registrationDetails))
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
    registrationDetails.national_id.match('^[0-9]{8}[a-zA-Z]{1}[0-9]{2}$') &&
    isDate(registrationDetails.date_of_first_practice) &&
    registrationDetails.ncz_registration_number.match(
      '^[a-zA-Z]{2}[0-9]{6}$',
    ) &&
    registrationDetails.mobile_number.toString().match('^[0-9]+$') &&
    (registrationDetails.national_id_media_id === undefined ||
      typeof registrationDetails.national_id_media_id === 'number') &&
    (registrationDetails.ncz_registration_card_media_id === undefined ||
      typeof registrationDetails.ncz_registration_card_media_id === 'number') &&
    (registrationDetails.face_picture_media_id === undefined ||
      typeof registrationDetails.face_picture_media_id === 'number') &&
    (registrationDetails.approved_by == undefined ||
      typeof registrationDetails.approved_by === 'number')
}

function isDate(date: Date): boolean {
  return date.toISOString().match('^[0-9]{4}[-][0-9]{2}[-][0-9]{2}') !== null
}
