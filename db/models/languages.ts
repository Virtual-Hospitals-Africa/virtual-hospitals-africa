import { TrxOrDbOrQueryCreator } from '../../types.ts'

export const languages = {
  getAll(trx: TrxOrDbOrQueryCreator) {
    return trx.selectFrom('languages').selectAll().execute()
  },
}
