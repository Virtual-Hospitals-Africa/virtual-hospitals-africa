import * as addresses from './addresses.ts'
import { Address, TrxOrDb } from '../../types.ts'

export function getById(trx: TrxOrDb, { patient_id }: { patient_id: string }) {
  return trx
    .selectFrom('patients')
    .innerJoin(
      'addresses',
      'addresses.id',
      'patients.address_id',
    )
    .where('patients.id', '=', patient_id)
    .selectAll('addresses')
    .executeTakeFirst()
}

function addressToInsert(address: Address): addresses.AddressInsert {
  return {
    street_number: address.street_number ?? undefined,
    route: address.route ?? undefined,
    unit: address.unit ?? undefined,
    street: address.street ?? undefined,
    locality: address.locality ?? '',
    administrative_area_level_1: address.administrative_area_level_1 ??
      undefined,
    administrative_area_level_2: address.administrative_area_level_2 ??
      undefined,
    country: address.country,
    postal_code: address.postal_code ?? undefined,
  }
}

export async function updateById(
  trx: TrxOrDb,
  { patient_id, address }: {
    patient_id: string
    address: Address
  },
) {
  const created_address = await addresses.insert(
    trx,
    addressToInsert(address),
  )
  await trx.updateTable('patients')
    .where('patients.id', '=', patient_id)
    .set('address_id', created_address.id)
    .executeTakeFirstOrThrow()
}
