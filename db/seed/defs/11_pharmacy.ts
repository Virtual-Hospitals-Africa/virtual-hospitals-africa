import { TrxOrDb } from '../../../types.ts'
import { create } from '../create.ts'
import parseCsv from '../../../util/parseCsv.ts'

export default create(['pharmacies', 'pharmacy_employment'], importFromCsv)

async function importFromCsv(trx: TrxOrDb) {
  const pharmacies = await parseCsv('./db/resources/pharmacies.tsv', {
    columnSeparator: '\t',
  })

  const representatives = await parseCsv(
    './db/resources/pharmacy_representatives.tsv',
    {
      columnSeparator: '\t',
    },
  )

  const pharmaciesData = []

  for await (const pharmacy of pharmacies) {
    delete pharmacy['\r']
    pharmaciesData.push(pharmacy)
  }

  // deno-lint-ignore no-explicit-any
  await trx.insertInto('pharmacies').values(pharmaciesData as any).execute()

  const representativesData = []

  for await (const representative of representatives) {
    delete representative['\r']
    const { licence_number, given_name, family_name, ..._resProps } =
      representative
    const pharmacy = await trx
      .selectFrom('pharmacies')
      .select(['id', 'licence_number'])
      .where('licence_number', '=', licence_number)
      .executeTakeFirst()
    if (!pharmacy) continue

    const pharmacist = await trx
      .selectFrom('pharmacists')
      .select(['id', 'given_name', 'family_name'])
      .where('given_name', '=', given_name)
      .where('family_name', '=', family_name)
      .executeTakeFirst()

    if (!pharmacist) {
      console.warn(`Pharmacist not found: ${given_name} ${family_name}`)
      continue
    }

    representativesData.push({
      pharmacy_id: pharmacy.id,
      pharmacist_id: pharmacist.id,
      is_supervisor: true,
    })
  }

  await trx
    .insertInto('pharmacy_employment')
    // deno-lint-ignore no-explicit-any
    .values(representativesData as any)
    .execute()
}
