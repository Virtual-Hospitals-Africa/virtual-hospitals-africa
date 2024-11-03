import { create } from '../create.ts'
import { DIAGNOSTIC_TESTS, EXAMINATIONS } from '../../../shared/examinations.ts'
import { TrxOrDb } from '../../../types.ts'

export default create(
  [
    'examinations',
    'diagnostic_tests',
  ],
  addSeedData,
)

async function addSeedData(trx: TrxOrDb) {
  await trx.insertInto('examinations').values(
    EXAMINATIONS.map((name, index) => ({ name, order: index + 1 })),
  ).execute()

  await trx.insertInto('diagnostic_tests').values(
    DIAGNOSTIC_TESTS.map((name) => ({ name })),
  ).execute()
}
