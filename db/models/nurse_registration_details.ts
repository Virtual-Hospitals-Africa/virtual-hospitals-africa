import { isNumber } from 'https://deno.land/x/redis@v0.30.0/stream.ts'
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

function inputValidation(registrationDetails: NurseRegistrationDetails) {
  return isNumber(registrationDetails.health_worker_id) &&
    registrationDetails.national_id.match('^[0-9]{8}[a-zA-Z]{1}[0-9]{2}$') &&
    isDate(registrationDetails.date_of_first_practice) &&
    registrationDetails.ncz_registration_number.match(
      '^[a-zA-Z]{2}[0-9]{6}$',
    ) &&
    registrationDetails.mobile_number.toString().match('^[0-9]+$') &&
    (registrationDetails.national_id_media_id === undefined ||
      isNumber(registrationDetails.national_id_media_id)) &&
    (registrationDetails.ncz_registration_card_media_id === undefined ||
      isNumber(registrationDetails.ncz_registration_card_media_id)) &&
    (registrationDetails.face_picture_media_id === undefined ||
      isNumber(registrationDetails.face_picture_media_id))
}

function isDate(date: Date): boolean {
  return date.toString().match('^[0-9]{4}[-][0-9]{2}[-][0-9]{2}$') !== null
}
