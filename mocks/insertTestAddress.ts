import { TrxOrDb } from '../types.ts'
import { addresses } from '../db/models/addresses.ts'
import createTestAddress from './createTestAddress.ts'

export default function insertTestAddress(
  trx: TrxOrDb,
) {
  return addresses.insert(trx, createTestAddress())
}
