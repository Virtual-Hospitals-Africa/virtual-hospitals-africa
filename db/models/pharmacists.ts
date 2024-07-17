import { assert } from 'std/assert/assert.ts'
import {  Maybe, RenderedPharmacist, TrxOrDb } from '../../types.ts'
import { now } from '../helpers.ts'
import { haveNames } from '../../util/haveNames.ts'
import { sql } from 'kysely/index.js'

export function update(
  trx: TrxOrDb,
  pharmacist_id: string,
  data: {
    licence_number?: string
    pin?: string | null
  },
) {
  return trx.updateTable('pharmacists').set(data).where(
    'id',
    '=',
    pharmacist_id,
  ).execute()
}

export async function get(trx: TrxOrDb, query: {
  licence_number?: string
  given_name?: string
  family_name?: string
  pharmacist_type?: string
  include_revoked?: boolean
} = {}) {
  const pharmacists = await trx.selectFrom('pharmacists')
    .select([
      'id',
      'licence_number',
      'prefix',
      'given_name',
      'family_name',
      'address',
      'town',
      'expiry_date',
      'pharmacist_type',
    ])
    .where('revoked_at', query.include_revoked ? 'is not' : 'is', null)
    .orderBy('given_name', 'asc')
    .orderBy('family_name', 'asc')
    .limit(50)
    .execute()

  return pharmacists.map((pharmacist) => ({
    ...pharmacist,
    expiry_date: new Date(pharmacist.expiry_date).toISOString().split('T')[0],
    actions: {
      revoke: `/regulator/pharmacists/${pharmacist.id}/revoke`,
    },
  }))
}

export function getById(trx: TrxOrDb, pharmacist_id: string) {
  return trx.selectFrom('pharmacists')
    .select([
      'id',
      'licence_number',
      'prefix',
      'given_name',
      'family_name',
      'address',
      'town',
      'expiry_date',
      'pharmacist_type',
    ])
    .where('id', '=', pharmacist_id)
    .executeTakeFirst()
}

export function revoke(
  trx: TrxOrDb,
  data: {
    pharmacist_id: string
    regulator_id: number
  },
) {
  return trx.updateTable('pharmacists').set({
    revoked_at: now,
    revoked_by: data.regulator_id,
  }).where('id', '=', data.pharmacist_id).execute()
}

const baseSelect = (trx: TrxOrDb) =>
  trx
    .selectFrom('pharmacists')
    .select((eb) => [
      eb.ref('pharmacists.given_name').$notNull().as('given_name')
    ])


export async function getAllWithSearchConditions(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<RenderedPharmacist[]> {
  let query = trx.selectFrom('pharmacists')
  .select([
    'id',
    'licence_number',
    'prefix',
    'given_name',
    'family_name',
    'address',
    'town',
    'expiry_date',
    'pharmacist_type',
  ]).where('pharmacists.given_name', 'is not', null);
  let queryGivenName = query
  if (search) {
    queryGivenName = query.where('pharmacists.given_name', 'ilike', `%${search}%`).orderBy('pharmacists.given_name','asc')
    // queryFamilyName = query.where('pharmacists.family_name', 'ilike', `%${search}%`) 
    // query = queryGivenName.union(queryFamilyName).orderBy('pharmacists.given_name','asc')
  }
  const pharmacists = await queryGivenName.execute()
  const renderedPharmacists: RenderedPharmacist[] = pharmacists.map(pharmacist => ({
    id: pharmacist.id,
    given_name: pharmacist.given_name,
    licence_number: pharmacist.licence_number,
    prefix: pharmacist.prefix,
    family_name: pharmacist.family_name,
    address: pharmacist.address,
    town: pharmacist.town,
    pharmacist_type: pharmacist.pharmacist_type,
  }));
  return renderedPharmacists
}
