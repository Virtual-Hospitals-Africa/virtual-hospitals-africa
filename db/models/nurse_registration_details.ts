import {
  Address,
  HasStringId,
  ISODateString,
  Maybe,
  NurseRegistrationDetails,
  TrxOrDb,
} from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { upsert as upsertAddress } from './address.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { isoDate } from '../helpers.ts'

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
  { address, address_id, ...registration_details }:
    UpsertableNurseRegistrationDetails,
) {
  assertIsRegistrationDetails(registration_details)
  if (address) {
    assert(
      !address_id,
      'address_id must not be defined if address is specified',
    )
    address_id = (await upsertAddress(trx, address)).id
  }
  assert(address_id, 'address_id must be defined')
  return trx
    .insertInto('nurse_registration_details')
    .values({ ...registration_details, address_id })
    .execute()
}

export async function getInProgress(
  trx: TrxOrDb,
  opts: {
    health_worker_id: string
  },
  // deno-lint-ignore no-explicit-any
): Promise<Record<string, any>> {
  const in_progress = await trx
    .selectFrom('nurse_registration_details_in_progress')
    .select('data')
    .where('health_worker_id', '=', opts.health_worker_id)
    .executeTakeFirst()

  // deno-lint-ignore no-explicit-any
  return (in_progress?.data as any) || {}
}

export function setInProgress(
  trx: TrxOrDb,
  values: {
    health_worker_id: string
    // deno-lint-ignore no-explicit-any
    data: Record<string, any>
  },
) {
  return trx
    .insertInto('nurse_registration_details_in_progress')
    .values(values)
    .onConflict((oc) =>
      oc.column('health_worker_id').doUpdateSet((eb) => ({
        data: eb.ref('excluded.data'),
      }))
    )
    .executeTakeFirstOrThrow()
}

export function removeInProgress(
  trx: TrxOrDb,
  opts: {
    health_worker_id: string
  },
) {
  return trx
    .deleteFrom('nurse_registration_details_in_progress')
    .where('health_worker_id', '=', opts.health_worker_id)
    .execute()
}

export function get(
  trx: TrxOrDb,
  opts: {
    health_worker_id: string
  },
): Promise<HasStringId<NurseRegistrationDetails> | undefined> {
  return trx
    .selectFrom('nurse_registration_details')
    .select((eb) => [
      'id',
      'created_at',
      'updated_at',
      'health_worker_id',
      'gender',
      isoDate(eb.ref('birthDate')).as('birthDate'),
      isoDate(eb.ref('date_of_first_practice')).as('date_of_first_practice'),
      'national_id_number',
      'ncz_registration_number',
      'mobile_number',
      'national_id_media_id',
      'ncz_registration_card_media_id',
      'face_picture_media_id',
      'nurse_practicing_cert_media_id',
      'approved_by',
      'address_id',
    ])
    .where('health_worker_id', '=', opts.health_worker_id)
    .executeTakeFirst()
}

export function approve(
  trx: TrxOrDb,
  opts: {
    approved_by: string
    health_worker_id: string
  },
) {
  return trx
    .updateTable('nurse_registration_details')
    .set({
      approved_by: opts.approved_by,
    })
    .where('approved_by', 'is', null)
    .where('health_worker_id', '=', opts.health_worker_id)
    .returningAll()
    .executeTakeFirst()
}

function assertIsRegistrationDetails(
  registration_details: unknown,
): asserts registration_details is NurseRegistrationDetails {
  assertOr400(isObjectLike(registration_details))
  assertOr400(typeof registration_details.health_worker_id === 'string')
  assertOr400(typeof registration_details.gender === 'string')
  assertOr400(
    (registration_details.gender === 'male') ||
      (registration_details.gender === 'female') ||
      (registration_details.gender === 'non-binary'),
  )
  assertOr400(typeof registration_details.national_id_number === 'string')
  assertOr400(/^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$/.test(
    registration_details.national_id_number,
  ))
  assertOr400(isDate(registration_details.birthDate))
  assertOr400(isDate(registration_details.date_of_first_practice))
  assertOr400(typeof registration_details.ncz_registration_number === 'string')
  assertOr400(
    /^[a-zA-Z]{2}[0-9]{6}$/.test(registration_details.ncz_registration_number),
  )
  assertOr400(typeof registration_details.mobile_number === 'string')
  assertOr400(/^[0-9]+$/.test(registration_details.mobile_number))
  assertOr400(isMaybeString(registration_details.national_id_media_id))
  assertOr400(
    isMaybeString(registration_details.ncz_registration_card_media_id),
  )
  assertOr400(isMaybeString(registration_details.face_picture_media_id))
  assertOr400(
    isMaybeString(registration_details.nurse_practicing_cert_media_id),
  )
  assertOr400(isMaybeString(registration_details.approved_by))
}

function isDate(date: unknown): date is ISODateString {
  return typeof date === 'string' &&
    /^[0-9]{4}[-][0-9]{2}[-][0-9]{2}$/.test(date)
}

function isMaybeString(num: unknown): num is Maybe<string> {
  return num == null || typeof num === 'string'
}
