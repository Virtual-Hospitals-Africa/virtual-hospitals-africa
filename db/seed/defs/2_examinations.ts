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
    EXAMINATIONS.map((name, index) => {
      const is_head_to_toe = name.startsWith('Head-to-toe Assessment')
      const page = is_head_to_toe ? 'head_to_toe_assessment' : 'examinations'

      const tab = is_head_to_toe
        ? name.replace('Head-to-toe Assessment (', '')
          .replace(')', '')
        : name

      const path = `/${page}?tab=${tab}`

      return {
        name,
        is_head_to_toe,
        page,
        tab,
        path,
        order: index + 1,
      }
    }),
  ).execute()

  await trx.insertInto('diagnostic_tests').values(
    DIAGNOSTIC_TESTS.map((name) => ({ name })),
  ).execute()
}
