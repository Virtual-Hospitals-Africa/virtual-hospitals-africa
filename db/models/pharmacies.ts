import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { address_town_sql, name_sql } from './pharmacists.ts'
import { RenderedPharmacy, Supervisor } from '../../types.ts'

export async function get(
  trx: TrxOrDb,
  page: number = 1,
  rowsPerPage: number = 10,
) {
  const offset = (page - 1) * rowsPerPage
  const pharmacies = await trx
    .selectFrom('premises')
    .leftJoin(
      'premise_supervisors',
      'premises.id',
      'premise_supervisors.premise_id',
    )
    .leftJoin(
      'pharmacists',
      'premise_supervisors.pharmacist_id',
      'pharmacists.id',
    )
    .select((eb) => [
      'premises.id',
      'premises.name',
      'premises.licence_number',
      'premises.licensee',
      address_town_sql('premises').as('address'),
      'premises.expiry_date',
      'premises.premises_types',
      jsonArrayFrom(
        eb
          .selectFrom('premise_supervisors')
          .select([
            'id',
            'prefix',
            name_sql('premise_supervisors').as('name'),
            sql<
              string
            >`'/regulator/pharmacists/' || premise_supervisors.pharmacist_id`
              .as('href'),
          ])
          .whereRef(
            'premises.id',
            '=',
            'premise_supervisors.premise_id',
          ),
      ).as('supervisors'),
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

export async function getById(
  trx: TrxOrDb,
  pharmacy_id: string,
): Promise<RenderedPharmacy | undefined> {
  const pharmacy = await trx
    .selectFrom('premises')
    .leftJoin(
      'premise_supervisors',
      'premises.id',
      'premise_supervisors.premise_id',
    )
    .leftJoin(
      'pharmacists',
      'premise_supervisors.pharmacist_id',
      'pharmacists.id',
    )
    .select((eb) => [
      'premises.id',
      'premises.name',
      'premises.licence_number',
      'premises.licensee',
      address_town_sql('premises').as('address'),
      'premises.town',
      'premises.expiry_date',
      'premises.premises_types',
      jsonArrayFrom(
        eb
          .selectFrom('premise_supervisors')
          .select([
            'id',
            'prefix',
            'family_name',
            'given_name',
            name_sql('premise_supervisors').as('name'),
            sql<
              string
            >`'/regulator/pharmacists/' || premise_supervisors.pharmacist_id`
              .as('href'),
          ])
          .whereRef('premises.id', '=', 'premise_supervisors.premise_id'),
      ).as('supervisors'),
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
    .where('premises.id', '=', pharmacy_id)
    .executeTakeFirst()

  return (
    pharmacy && {
      ...pharmacy,
      expiry_date: new Date(pharmacy.expiry_date).toISOString().split('T')[0],
      supervisors: pharmacy.supervisors
        .filter((s): s is Supervisor => s.id !== null),
    }
  )
}
