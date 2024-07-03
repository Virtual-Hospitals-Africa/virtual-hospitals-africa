import { Kysely } from 'kysely'
import { create } from '../create.ts'
import parseCsv from '../../../util/parseCsv.ts'

export default create(['pharmacists'], importFromCsv)

// deno-lint-ignore no-explicit-any
async function importFromCsv(db: Kysely<any>) {
  for await (
    const pharmacist of parseCsv('./db/resources/pharmacists.tsv', {
      columnSeparator: '\t',
    })
  ) {
    await db
      .insertInto('pharmacists')
      .values(pharmacist)
      .execute()
  }
}
