import { TrxOrDb } from '../../types.ts'

export function getAll(trx: TrxOrDb) {
  return trx.selectFrom('languages').selectAll().execute()
}
