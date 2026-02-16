// import { TrxOrDb } from '../../../types.ts'
// import { define } from '../define.ts'
// import { parseTsvTyped } from '../../../util/parseCsv.ts'
// import { employment } from '../../models/employment.ts'
// import { health_workers } from '../../models/health_workers.ts'
// import z from 'zod'
// import { sql } from 'kysely'
// import type { NamePrefix } from '../../../db.d.ts'
// import { addresses } from '../../models/addresses.ts'
// import { employees } from '../../models/employees.ts'

// const VHA_TEST_CLINIC_ZIMBABWE_ID = '00000000-0000-0000-0000-000000000003'

// const ZimbabwePharmacistRow = z.object({
//   licence_number: z.string(),
//   pharmacist_type: z.enum([
//     'Dispensing Medical Practitioner',
//     'Ind Clinic Nurse',
//     'Pharmacist',
//     'Pharmacy Technician',
//   ]),
//   prefix: z.string().nullable(),
//   given_name: z.string(),
//   family_name: z.string(),
//   address: z.string().nullable(),
//   town: z.string().nullable(),
//   expiry_date: z.string().transform(parseExpiryDate),
// })

// export default define(
//   ['health_workers', 'employment', 'health_worker_licences'],
//   importFromCsv,
// )

// function parseExpiryDate(s: string): Date {
//   const [mm, dd, yyyy] = s.split('/').map(Number)
//   return new Date(yyyy, mm - 1, dd)
// }

// async function importFromCsv(trx: TrxOrDb) {
//   for await (
//     const row of parseTsvTyped(
//       './db/resources/zimbabwe_pharmacists.tsv',
//       ZimbabwePharmacistRow,
//       { interpret_integers: false },
//     )
//   ) {
//     const address = row.address === 'LOCUM' ? null : row.address
//     const health_worker_id = await health_workers.insertOne(trx, {
//       first_names: row.given_name,
//       surname: row.family_name,
//       name: `${row.given_name} ${row.family_name}`,
//       preferred_name: row.given_name,
//     })
//     const employment_row = await employment.addOne(trx, {
//       health_worker_id,
//       organization_id: VHA_TEST_CLINIC_ZIMBABWE_ID,
//       profession: 'pharmacist',
//       is_admin: false,
//     })
//     const inserted_address = address
//       ? await addresses.insert(
//         trx,
//         addresses.insertValues({
//           country: 'ZW',
//           locality: row.town,
//           street: address,
//         }),
//       )
//       : null
//     await trx.insertInto('health_worker_licences').values({
//       pharmacist_id: employment_row.id,
//       licence_number: row.licence_number,
//       prefix: (row.prefix as NamePrefix | null) ?? null,
//       given_name: row.given_name,
//       family_name: row.family_name,
//       address_id: inserted_address?.id,
//       expiry_date: row.expiry_date,
//       pharmacist_type: row.pharmacist_type,
//       country: 'ZW',
//     }).execute()
//   }

//   const representatives: { licence_number: string; given_name: string; family_name: string }[] = []
//   for await (
//     const r of parseTsvTyped(
//       './db/resources/zimbabwe_pharmacy_representatives.tsv',
//       z.object({
//         licence_number: z.string(),
//         given_name: z.string(),
//         family_name: z.string(),
//       }),
//     )
//   ) {
//     representatives.push(r)
//   }
//   for (const representative of representatives) {
//     const { licence_number, given_name, family_name } = representative
//     const organization = await trx
//       .selectFrom('organizations')
//       .select(['id'])
//       .where(sql`organizations.licence_number`, '=', licence_number)
//       .executeTakeFirst()
//     if (!organization) continue

//     const licence_row = await trx
//       .selectFrom('health_worker_licences')
//       .select(['pharmacist_id', 'given_name', 'family_name'])
//       .where('given_name', '=', given_name)
//       .where('family_name', '=', family_name)
//       .executeTakeFirst()

//     if (!licence_row) {
//       console.warn(`Pharmacist not found: ${given_name} ${family_name}`)
//       continue
//     }

//     await employees.add(trx, {})

//     trx
//       .insertInto('employment')
//       .values({
//         organization_id: organization.id,
//         pharmacist_id: licence_row.pharmacist_id,
//         is_admin: true,
//       })
//       .execute()
//   }
// }
