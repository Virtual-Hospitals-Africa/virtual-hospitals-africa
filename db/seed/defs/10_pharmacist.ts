import { Kysely } from 'kysely'
import { DB } from '../../../db.d.ts'
import { create } from '../create.ts'
import parseCsv from '../../../util/parseCsv.ts'

export default create(['pharmacists'], importFromCsv)

async function importFromCsv(db: Kysely<DB>) {
  for await (
    const pharmacist of parseCsv('./db/resources/pharmacists.tsv', {
      columnSeparator: '\t',
    })
  ) {
    await db
      .insertInto('pharmacists')
      // deno-lint-ignore no-explicit-any
      .values(pharmacist as any)
      .execute()
  }
}
