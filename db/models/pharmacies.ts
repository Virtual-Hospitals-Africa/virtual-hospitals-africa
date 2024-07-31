import { Maybe, RenderedPharmacy, TrxOrDb } from '../../types.ts'
import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { address_town_sql, name_sql } from './pharmacists.ts'

export async function getAllWithSearchConditions(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<RenderedPharmacy[]> {
  let query = trx.selectFrom('premises')
    .select([
      'id',
      'name',
      'licence_number',
      'licensee',
      'address',
      'town',
      'expiry_date',
      'premises_types',
    ]).where('name', 'is not', null)
  let queryGivenName = query
  if (search) {
    queryGivenName = query.where('name', 'ilike', `%${search}%`).orderBy(
      'name',
      'asc',
    )
    // queryFamilyName = query.where('pharmacists.family_name', 'ilike', `%${search}%`)
    // query = queryGivenName.union(queryFamilyName).orderBy('pharmacists.given_name','asc')
  }
  const pharmacies = await queryGivenName.execute()
  const renderedPharmacies: RenderedPharmacy[] = pharmacies.map((pharmacy) => ({
    id: pharmacy.id,
    name: pharmacy.name,
    licence_number: pharmacy.licence_number,
    licensee: pharmacy.licensee,
    address: pharmacy.address,
    town: pharmacy.town,
    expiry_date: pharmacy.expiry_date.toDateString(),
    premises_types: pharmacy.premises_types,
  }))
  return renderedPharmacies
}

export function getById(trx: TrxOrDb, pharmacy_id: string) {
  return trx
    .selectFrom('premises')
    .select([
      'id',
      'name',
      'licence_number',
      'licensee',
      'address',
      'town',
      'expiry_date',
      'premises_types',
    ])
    .where('id', '=', pharmacy_id)
    .executeTakeFirst()
}

export async function get(
  trx: TrxOrDb,
  page: number = 1,
  rowsPerPage: number = 10,
) {
  const offset = (page - 1) * rowsPerPage
  const pharmacies = await trx
    .selectFrom('premises')
    .select([
      'id',
      'name',
      'licence_number',
      'licensee',
      'address',
      'town',
      'expiry_date',
      'premises_types',
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
