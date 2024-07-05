import { TrxOrDb } from '../../types.ts'

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

export async function getAllPharmacists(trx: TrxOrDb) {
  const pharmacists = await trx.selectFrom('pharmacists')
    .select([
      'licence_number',
      'prefix',
      'given_name',
      'family_name',
      'address',
      'town',
      'expiry_date',
      'pharmacist_type',
    ])
    .orderBy('given_name', 'asc')
    .orderBy('family_name', 'asc')
    .limit(50)
    .execute()

  return pharmacists.map((pharmacist) => ({
    ...pharmacist,
    expiry_date: new Date(pharmacist.expiry_date).toISOString().split('T')[0],
  }))
}
