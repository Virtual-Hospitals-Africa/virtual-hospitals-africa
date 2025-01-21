import { create } from '../create.ts'
import { TrxOrDb } from '../../../types.ts'
import { collect } from '../../../util/inParallel.ts'
import parseCsv from '../../../util/parseCsv.ts'

export default create(['examinations'], addSeedData)

async function addSeedData(trx: TrxOrDb) {
  let order = 0
  const exams = (await collect(
    parseCsv('./db/resources/examinations.tsv', {
      columnSeparator: '\t',
    }),
  )).map((exam) => (
    {
      ...exam,
      order: ++order,
      path: `/${exam.encounter_step}?exam=${exam.tab}`,
    }
  ))
  await trx.insertInto('examinations').values(exams as any).execute()
}
