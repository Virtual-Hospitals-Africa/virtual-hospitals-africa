import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { jsonBuildObject } from '../helpers.ts'

export async function get(
  trx: TrxOrDb,
  page: number = 1,
  rowsPerPage: number = 10
) {
  const offset = (page - 1) * rowsPerPage
  const pharmacies = await trx
    .selectFrom('premises')
    .leftJoin(
      'premise_supervisors',
      'premises.id',
      'premise_supervisors.premise_id'
    )
    .leftJoin(
      'pharmacists',
      'premise_supervisors.pharmacist_id',
      'pharmacists.id'
    )
    .select((eb) => [
      'premises.id',
      'premises.name',
      'premises.licence_number',
      'premises.licensee',
      'premises.address',
      'premises.town',
      'premises.expiry_date',
      'premises.premises_types',
      sql`json_agg(${jsonBuildObject({
        id: eb.ref('premise_supervisors.id'),
        prefix: eb.ref('premise_supervisors.prefix'),
        given_name: eb.ref('premise_supervisors.given_name'),
        family_name: eb.ref('premise_supervisors.family_name'),
        href: sql<string>`'/regulator/pharmacists/' || premise_supervisors.id`,
      })}
        ) FILTER (WHERE premise_supervisors.id IS NOT NULL)`.as('supervisors'),
    ])
    .groupBy([
      'premises.id',
      'premises.name',
      'premises.licence_number',
      'premises.licensee',
      'premises.address',
      'premises.town',
      'premises.expiry_date',
      'premises.premises_types',
    ])
    .orderBy('name', 'asc')
    .limit(rowsPerPage)
    .offset(offset)
    .execute()

  const totalRowsResult = await trx
    .selectFrom('premises')
    .select((eb) => eb.fn.count('id').as('totalRows'))
    .execute()

  const totalRows = parseInt(totalRowsResult[0].totalRows.toString(), 10)

  const pharmaciesList = pharmacies.map((pharmacy) => ({
    ...pharmacy,
    expiry_date: new Date(pharmacy.expiry_date).toISOString().split('T')[0],
  }))

  return {
    pharmaciesList,
    totalRows,
  }
}
