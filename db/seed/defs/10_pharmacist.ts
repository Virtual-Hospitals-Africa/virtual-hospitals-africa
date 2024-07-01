import { Kysely } from 'kysely'
import { create } from '../create.ts'
import parseCsv from '../../../util/parseCsv.ts'

export default create(['pharmacists'], importFromCsv)

// deno-lint-ignore no-explicit-any
async function importFromCsv(db: Kysely<any>) {
  const pharmacists = await parseCsv('./db/resources/pharmacists.tsv', {
    columnSeparator: '\t',
  })

  const pharmacistsData = []

  for await (const pharmacist of pharmacists) {
    pharmacistsData.push(pharmacist)
  }

  await db
    .insertInto('pharmacists')
    .values(pharmacistsData)
    .execute()
}
