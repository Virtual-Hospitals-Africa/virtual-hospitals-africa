//deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import { create } from '../create.ts'
import parseCsv from '../../../util/parseCsv.ts'

export default create(['pharmacists'], importFromCsv)

async function importFromCsv(db: Kysely<any>) {
  const pharmacists = await parseCsv('./db/resources/pharmacists.tsv', {
    columnSeparator: '\t',
  })

  const pharmacistsData = []

  for await (const pharmacistData of pharmacists) {
    pharmacistsData.push({
      licence_number: pharmacistData.licence_number,
      pharmacist_type: pharmacistData.pharmacist_type,
      prefix: pharmacistData.prefix || null,
      given_name: pharmacistData.given_name || null,
      family_name: pharmacistData.family_name || null, 
      address: pharmacistData.address,
      town: pharmacistData.town,
      expiry_date: pharmacistData.expiry_date,
    })
  }

  await db
    .insertInto('pharmacists')
    .values(pharmacistsData.map((pharmacistData) => pharmacistData))
    .execute()
}
