import { TrxOrDb } from '../../types.ts'

export const languages = {
  getAll(trx: TrxOrDb) {
    return trx.selectFrom('languages').selectAll().execute()
  },
}
