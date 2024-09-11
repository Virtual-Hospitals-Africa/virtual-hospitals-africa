import { sql } from 'kysely'
import { jsonArrayFrom, jsonBuildObject } from '../helpers.ts'
import { addressDisplaySql, nameSql } from './pharmacists.ts'
import { Maybe, RenderedPharmacy } from '../../types.ts'
import { TrxOrDb } from '../../types.ts'
import { PharmaciesTypes } from '../../db.d.ts'
import { insert as insertPharmacyEmployment } from './pharmacy_employment.ts'

const view_sql = sql<
  string
>`concat('/regulator/pharmacies/', pharmacies.id::text)`

function getQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('pharmacies')
    .select((eb) => [
      'pharmacies.id',
      'pharmacies.name',
      'pharmacies.licence_number',
      'pharmacies.licensee',
      'pharmacies.address',
      'pharmacies.town',
      addressDisplaySql('pharmacies').as('address_display'),
      view_sql.as('href'),
      sql<string>`TO_CHAR(pharmacies.expiry_date, 'YYYY-MM-DD')`.as(
        'expiry_date',
      ),
      'pharmacies.pharmacies_types',
      jsonArrayFrom(
        eb
          .selectFrom('pharmacy_employment')
          .leftJoin(
            'pharmacists',
            'pharmacy_employment.pharmacist_id',
            'pharmacists.id',
          )
          .select([
            'pharmacy_employment.id',
            'pharmacists.prefix',
            'pharmacists.family_name',
            'pharmacists.given_name',
            nameSql('pharmacists').as('name'),
            sql<
              string
            >`'/regulator/pharmacists/' || pharmacy_employment.pharmacist_id`
              .as(
                'href',
              ),
          ])
          .whereRef('pharmacies.id', '=', 'pharmacy_employment.pharmacy_id'),
      ).as('supervisors'),
      jsonBuildObject({
        view: view_sql,
      }).as('actions'),
    ])
    .orderBy('pharmacies.name', 'asc')
}

export async function get(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
    page?: number
    rowsPerPage?: number
  },
) {
  const page = opts.page || 1
  const rowsPerPage = opts.rowsPerPage || 10
  const offset = (page - 1) * rowsPerPage
  let query = getQuery(trx)

  if (opts.search) {
    query = query.where('pharmacies.name', 'ilike', `%${opts.search}%`)
  }

  const pharmacies = await query.limit(rowsPerPage).offset(offset).execute()

  const totalRowsResult = await trx
    .selectFrom('pharmacies')
    .select((eb) => eb.fn.count('id').as('totalRows'))
    .execute()

  const totalRows = parseInt(totalRowsResult[0].totalRows.toString(), 10)

  return {
    pharmacies,
    totalRows,
  }
}

export function getById(
  trx: TrxOrDb,
  pharmacy_id: string,
): Promise<RenderedPharmacy | undefined> {
  return getQuery(trx)
    .where('pharmacies.id', '=', pharmacy_id)
    .executeTakeFirst()
}

type PharmacySupervisorInsert = {
  id: string
  name: string
}

export type PharmacyInsert = {
  address: string | null
  town: string | null
  expiry_date: string
  licence_number: string
  licensee: string
  name: string
  pharmacies_types: PharmaciesTypes
  supervisors?: PharmacySupervisorInsert[]
}

export async function insert(
  trx: TrxOrDb,
  data: PharmacyInsert,
): Promise<{ id: string }> {
  const { supervisors, ...pharmacyData } = data
  const pharmacy = await trx
    .insertInto('pharmacies')
    .values(pharmacyData)
    .returning('id')
    .executeTakeFirstOrThrow()
  if (!supervisors) return pharmacy
  const pharmacyEmployments = supervisors.map((supervisor) => ({
    pharmacist_id: supervisor.id,
    pharmacy_id: pharmacy.id,
    is_supervisor: true,
  }))
  await insertPharmacyEmployment(trx, pharmacyEmployments)
  return pharmacy
}
