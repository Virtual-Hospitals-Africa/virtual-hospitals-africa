import { Allergy, TrxOrDb } from '../../types.ts'
import memoize from '../../util/memoize.ts'

export const getAll = memoize((trx: TrxOrDb): Promise<Allergy[]> =>
  trx
    .selectFrom('allergies')
    .select([
      'id',
      'name',
    ])
    .execute(), () => 'allergies')
