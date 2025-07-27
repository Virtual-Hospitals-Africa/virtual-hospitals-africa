import { TrxOrDb } from '../../../types.ts'
import { create } from '../create.ts'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import z from 'zod'

export default create(['pharmacies', 'pharmacy_employment'], importFromCsv)

async function importFromCsv(trx: TrxOrDb) {
  const representatives = await parseTsvTyped(
    './db/resources/zimbabwe_pharmacy_representatives.tsv',
    z.object({
      licence_number: z.string(),
      given_name: z.string(),
      family_name: z.string(),
    }),
  )

  for await (
    const pharmacy of parseTsvTyped(
      './db/resources/zimbabwe_pharmacies.tsv',
      z.object({
        address: z.string(),
        town: z.string(),
        expiry_date: z.string(),
        licence_number: z.string(),
        licensee: z.string(),
        name: z.string(),
        pharmacies_types: z.enum([
          'Clinics: Class A',
          'Clinics: Class B',
          'Clinics: Class C',
          'Clinics: Class D',
          'Dispensing medical practice',
          'Hospital pharmacies',
          'Pharmacies: Research',
          'Pharmacies: Restricted',
          'Pharmacy in any other location',
          'Pharmacy in rural area',
          'Pharmacy located in the CBD',
          'Wholesalers',
        ]),
      }),
    )
  ) {
    await trx.insertInto('pharmacies').values({
      ...pharmacy,
      country: 'ZW',
    })
      .execute()
  }

  for await (const representative of representatives) {
    const { licence_number, given_name, family_name } = representative
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

    await trx
      .insertInto('pharmacy_employment')
      .values({
        pharmacy_id: pharmacy.id,
        pharmacist_id: pharmacist.id,
        is_supervisor: true,
      })
      .execute()
  }
}
