import * as addresses from './addresses.ts'
import { TrxOrDb } from '../../types.ts'

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

export async function updateById(
  trx: TrxOrDb,
  { patient_id, address }: {
    patient_id: string
    address: addresses.AddressInsert
  },
) {
  const created_address = await addresses.insert(
    trx,
    address,
  )
  await trx.updateTable('patients')
    .where('patients.id', '=', patient_id)
    .set('address_id', created_address.id)
    .executeTakeFirstOrThrow()
}
