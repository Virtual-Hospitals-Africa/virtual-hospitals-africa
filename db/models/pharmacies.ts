import { sql } from 'kysely'
import { jsonArrayFrom } from '../helpers.ts'
import { address_town_sql, name_sql } from './pharmacists.ts'
import { RenderedPharmacy, Supervisor } from '../../types.ts'
import { Maybe, TrxOrDb } from '../../types.ts'

export async function getAllWithSearchConditions(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<RenderedPharmacy[]> {
  let query = trx.selectFrom('pharmacies')
    .select([
      'id',
      'name',
      'licence_number',
      'licensee',
      'address',
      'town',
      'expiry_date',
      'pharmacies_types',
    ]).where('name', 'is not', null).limit(30)
  if (search) {
    query = query.where('name', 'ilike', `%${search}%`).orderBy('name', 'asc')
  }
  const pharmacies = await query.execute()
  const renderedPharmacies: RenderedPharmacy[] = pharmacies.map((pharmacy) => ({
    id: pharmacy.id,
    name: pharmacy.name,
    licence_number: pharmacy.licence_number,
    licensee: pharmacy.licensee,
    address: pharmacy.address,
    town: pharmacy.town,
    expiry_date: pharmacy.expiry_date.toDateString(),
    pharmacies_types: pharmacy.pharmacies_types,
    supervisors: [],
    actions: {
      view: `/regulator/pharmacies/${pharmacy.id}`,
    },
  }))
  return renderedPharmacies
}

export async function get(
  trx: TrxOrDb,
  page: number = 1,
  rowsPerPage: number = 10,
) {
  const offset = (page - 1) * rowsPerPage
  const pharmacies = await trx
    .selectFrom('pharmacies')
    .leftJoin(
      'pharmacy_employment',
      'pharmacies.id',
      'pharmacy_employment.pharmacy_id',
    )
    .leftJoin(
      'pharmacists',
      'pharmacy_employment.pharmacist_id',
      'pharmacists.id',
    )
    .select((eb) => [
      'pharmacies.id',
      'pharmacies.name',
      'pharmacies.licence_number',
      'pharmacies.licensee',
      address_town_sql('pharmacies').as('address'),
      'pharmacies.expiry_date',
      'pharmacies.pharmacies_types',
      jsonArrayFrom(
        eb
          .selectFrom('pharmacy_employment')
          .select([
            'id',
            'prefix',
            name_sql('pharmacy_employment').as('name'),
            sql<
              string
            >`'/regulator/pharmacists/' || pharmacy_employment.pharmacist_id`
              .as(
                'href',
              ),
          ])
          .whereRef('pharmacies.id', '=', 'pharmacy_employment.pharmacy_id'),
      ).as('supervisors'),
    ])
    .groupBy([
      'pharmacies.id',
      'pharmacies.name',
      'pharmacies.licence_number',
      'pharmacies.licensee',
      'pharmacies.address',
      'pharmacies.town',
      'pharmacies.expiry_date',
      'pharmacies.pharmacies_types',
    ])
    .orderBy('name', 'asc')
    .limit(rowsPerPage)
    .offset(offset)
    .execute()

  const totalRowsResult = await trx
    .selectFrom('pharmacies')
    .select((eb) => eb.fn.count('id').as('totalRows'))
    .execute()

  const totalRows = parseInt(totalRowsResult[0].totalRows.toString(), 10)

  const pharmaciesList = pharmacies.map((pharmacy) => ({
    ...pharmacy,
    expiry_date: new Date(pharmacy.expiry_date).toISOString().split('T')[0],
    actions: {
      view: `/regulator/pharmacies/${pharmacy.id}`,
    },
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
    .selectFrom('pharmacies')
    .leftJoin(
      'pharmacy_employment',
      'pharmacies.id',
      'pharmacy_employment.pharmacy_id',
    )
    .leftJoin(
      'pharmacists',
      'pharmacy_employment.pharmacist_id',
      'pharmacists.id',
    )
    .select((eb) => [
      'pharmacies.id',
      'pharmacies.name',
      'pharmacies.licence_number',
      'pharmacies.licensee',
      address_town_sql('pharmacies').as('address'),
      'pharmacies.town',
      'pharmacies.expiry_date',
      'pharmacies.pharmacies_types',
      jsonArrayFrom(
        eb
          .selectFrom('pharmacy_employment')
          .select([
            'id',
            'prefix',
            'family_name',
            'given_name',
            name_sql('pharmacy_employment').as('name'),
            sql<
              string
            >`'/regulator/pharmacists/' || pharmacy_employment.pharmacist_id`
              .as(
                'href',
              ),
          ])
          .whereRef('pharmacies.id', '=', 'pharmacy_employment.pharmacy_id'),
      ).as('supervisors'),
    ])
    .groupBy([
      'pharmacies.id',
      'pharmacies.name',
      'pharmacies.licence_number',
      'pharmacies.licensee',
      'pharmacies.address',
      'pharmacies.town',
      'pharmacies.expiry_date',
      'pharmacies.pharmacies_types',
    ])
    .where('pharmacies.id', '=', pharmacy_id)
    .executeTakeFirst()

  return (
    pharmacy && {
      ...pharmacy,
      expiry_date: new Date(pharmacy.expiry_date).toISOString().split('T')[0],
      supervisors: pharmacy.supervisors.filter(
        (s): s is Supervisor => s.id !== null,
      ),
      actions: {
        view: `/regulator/pharmacies/${pharmacy.id}`,
      },
    }
  )
}

export function insert(
  trx: TrxOrDb,
  data: RenderedPharmacy,
): Promise<{ id: string }> {
  return trx
    .insertInto('pharmacies')
    .values(data)
    .returning('id')
    .executeTakeFirstOrThrow()
}
