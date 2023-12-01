import { sql } from 'kysely'
import {
  Address,
  NurseRegistrationDetails,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { upsert as upsertAddress } from './address.ts'

export type UpsertableNurseRegistrationDetails =
  | NurseRegistrationDetails & { address?: undefined }
  | (
    & Omit<
      NurseRegistrationDetails,
      'address_id'
    >
    & {
      address_id?: undefined
      address: Address
    }
  )

export async function add(
  trx: TrxOrDb,
  { address, address_id, ...registrationDetails }:
    UpsertableNurseRegistrationDetails,
) {
  assert(
    inputValidation(registrationDetails),
    'failed at input validation',
  )
  if (address) {
    address_id = (await upsertAddress(trx, address)).id
  }
  assert(address_id, 'address_id must be defined')
  return trx
    .insertInto('nurse_registration_details')
    .values({ ...registrationDetails, address_id })
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
    .select([
      'id',
      'created_at',
      'updated_at',
      'health_worker_id',
      'gender',
      sql<string>`TO_CHAR(date_of_birth, 'YYYY-MM-DD')`.as(
        'date_of_birth',
      ),
      'national_id_number',
      sql<string>`TO_CHAR(date_of_first_practice, 'YYYY-MM-DD')`.as(
        'date_of_first_practice',
      ),
      'ncz_registration_number',
      'mobile_number',
      'national_id_media_id',
      'ncz_registration_card_media_id',
      'face_picture_media_id',
      'nurse_practicing_cert_media_id',
      'approved_by',
      'address_id',
    ])
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

// deno-lint-ignore no-explicit-any
function inputValidation(registrationDetails: any) {
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
    (registrationDetails.nurse_practicing_cert_media_id == null ||
      typeof registrationDetails.nurse_practicing_cert_media_id === 'number') &&
    (registrationDetails.approved_by == null ||
      typeof registrationDetails.approved_by === 'number')
}

function isDate(date: string): boolean {
  return /^[0-9]{4}[-][0-9]{2}[-][0-9]{2}$/.test(date)
}
