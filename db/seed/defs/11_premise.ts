//deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import { create } from '../create.ts'
import parseCsv from '../../../util/parseCsv.ts'

export default create(['premises', 'premise_supervisors'], importFromCsv)

async function importFromCsv(db: Kysely<any>) {
  const premises = await parseCsv('./db/resources/premises.tsv', {
    columnSeparator: '\t',
  })

  const representatives = await parseCsv(
    './db/resources/premise_representatives.tsv',
    {
      columnSeparator: '\t',
    },
  )

  const premisesData = []

  for await (const premise of premises) {
    delete premise['\r']
    premisesData.push(premise)
  }

  await db.insertInto('premises').values(premisesData).execute()

  const representativesData = []

  for await (const representative of representatives) {
    delete representative['\r']
    const { licence_number, ...resProps } = representative
    const premise = await db
      .selectFrom('premises')
      .select(['id', 'licence_number'])
      .where('licence_number', '=', licence_number)
      .executeTakeFirst()
    if (!premise) continue
    representativesData.push({
      premise_id: premise.id,
      ...resProps,
    })
  }

  await db
    .insertInto('premise_supervisors')
    .values(representativesData)
    .execute()
}
