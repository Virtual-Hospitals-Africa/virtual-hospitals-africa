import { TrxOrDb } from '../../../types.ts'
import { create } from '../create.ts'
import parseCsv from '../../../util/parseCsv.ts'

export default create(['pharmacists'], importFromCsv)

async function importFromCsv(trx: TrxOrDb) {
  for await (
    const pharmacist of parseCsv('./db/resources/pharmacists.tsv', {
      columnSeparator: '\t',
    })
  ) {
    if (pharmacist.address === 'LOCUM') {
      pharmacist.address = null
    }
    await trx
      .insertInto('pharmacists')
      // deno-lint-ignore no-explicit-any
      .values(pharmacist as any)
      .execute()
  }
}
