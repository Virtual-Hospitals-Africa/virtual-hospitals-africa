import { GeneralAssessment, TrxOrDb } from '../../types.ts'
import memoize from '../../util/memoize.ts'

export const getAll = memoize(
  (trx: TrxOrDb): Promise<GeneralAssessment[]> =>
    trx
      .selectFrom('general_assessments')
      .select([
        'id',
        'name',
        'type',
      ])
      .execute(),
  () => 'general_assessments',
)
