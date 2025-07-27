import { TrxOrDb } from '../../../types.ts'
import { create } from '../create.ts'
import { parseTsv } from '../../../util/parseCsv.ts'

export default create(['pharmacists'], importFromCsv)

async function importFromCsv(trx: TrxOrDb) {
  for await (
    const pharmacist of parseTsv('./db/resources/zimbabwe_pharmacists.tsv')
  ) {
    if (pharmacist.address === 'LOCUM') {
      pharmacist.address = null
    }
    await trx
      .insertInto('pharmacists')
      .values({
        // deno-lint-ignore no-explicit-any
        ...pharmacist as any,
        country: 'ZW',
      })
      .execute()
  }
}
