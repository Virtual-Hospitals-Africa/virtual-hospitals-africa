import { TrxOrDb } from '../../types.ts'

export function getAll(trx: TrxOrDb) {
  return trx.selectFrom('iso_639_2_b_languages').selectAll().execute()
}
