import { GeneralAssessment, TrxOrDb } from '../../types.ts'
import memoize from '../../util/memoize.ts'

export const getAll = memoize(
  (trx: TrxOrDb): Promise<GeneralAssessment[]> =>
    trx
      .selectFrom('general_assessments')
      .select([
        'assessment',
        'category',
      ])
      .execute(),
  () => 'general_assessments',
)
