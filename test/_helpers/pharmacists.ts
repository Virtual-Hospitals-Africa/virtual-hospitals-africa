import { TrxOrDb } from '../../types.ts'
import {
  type PharmacistInsert,
  pharmacists,
} from '../../db/models/pharmacists.ts'
import generateUUID from '../../util/uuid.ts'

export function testPharmacist() {
  return {
    licence_number: 'P01-0805-2024',
    prefix: 'Mrs' as const,
    given_name: `A Test Given Name ${generateUUID()}`,
    family_name: `A Test Family Name ${generateUUID()}`,
    address: 'Test Address',
    town: 'Test Town',
    expiry_date: '2030-01-01',
    pharmacist_type: 'Pharmacist' as const,
    country: 'ZW',
  }
}

export async function addTestPharmacist(
  trx: TrxOrDb,
  pharmacist?: PharmacistInsert,
) {
  const dummy_pharmacist = {
    ...testPharmacist(),
    ...pharmacist,
  }
  const { id } = await pharmacists.insert(trx, dummy_pharmacist)
  return {
    ...dummy_pharmacist,
    id,
  }
}

export function removeTestPharmacist(
  trx: TrxOrDb,
  pharmacistId: string,
) {
  return pharmacists.remove(trx, pharmacistId)
}
