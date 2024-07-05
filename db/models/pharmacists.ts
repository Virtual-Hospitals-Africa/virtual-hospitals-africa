import { TrxOrDb } from '../../types.ts'
import { now } from '../helpers.ts'

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
