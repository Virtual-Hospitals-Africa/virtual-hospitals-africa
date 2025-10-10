import { TrxOrDb } from '../../types.ts'
import sample from '../../util/sample.ts'
import * as addresses from '../../db/models/addresses.ts'

export function createTestAddress() {
  const country = 'ZA'
  const province = sample(['Province 1', 'Province 2'])
  const district = sample(['District 1', 'District 2'])
  const ward = sample(['Ward 1', 'Ward 2'])
  const street_number = Math.random().toString(36).substring(7)
  return {
    street: `${street_number} Main Street`,
    locality: ward,
    administrative_area_level_2: district,
    administrative_area_level_1: province,
    country,
  }
}

export function insertTestAddress(
  trx: TrxOrDb,
) {
  return addresses.insert(trx, createTestAddress())
}
