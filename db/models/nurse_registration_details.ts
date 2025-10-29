import { HasStringId, NurseRegistrationDetails, TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import * as addresses from './addresses.ts'
import { isoDate } from '../helpers.ts'
import { asMaybeNames } from './asNames.ts'
import { updateNames } from './health_workers.ts'

export type UpsertableNurseRegistrationDetails =
  & {
    name?: string
    first_names?: string
    surname?: string
    preferred_name?: string
  }
  & (
    | NurseRegistrationDetails & { address?: undefined }
    | (
      & Omit<
        NurseRegistrationDetails,
        'address_id'
      >
      & {
        address_id?: undefined
        address: addresses.AddressInsert
      }
    )
  )

export async function add(
  trx: TrxOrDb,
  {
    address,
    address_id,
    name,
    first_names,
    surname,
    preferred_name,
    ...registration_details
  }: UpsertableNurseRegistrationDetails,
) {
  if (address) {
    assert(
      !address_id,
      'address_id must not be defined if address is specified',
    )
    address_id = (await addresses.insert(trx, address)).id
  }
  const names = asMaybeNames({ name, first_names, surname, preferred_name })
  if (names) {
    await updateNames(trx, registration_details.health_worker_id, names)
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
      'nurse_registration_details.sex',
      'gender',
      isoDate(eb.ref('date_of_birth')).as('date_of_birth'),
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
