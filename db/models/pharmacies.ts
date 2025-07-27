import { sql } from 'kysely'
import { jsonArrayFrom, jsonBuildObject } from '../helpers.ts'
import { addressDisplaySql, nameSql } from './pharmacists.ts'
import { RenderedPharmacy } from '../../types.ts'
import { TrxOrDb } from '../../types.ts'
import { PharmaciesTypes } from '../../db.d.ts'
import { insert as insertPharmacyEmployment } from './pharmacy_employment.ts'
import { base } from './_base.ts'

const view_sql = sql<
  string
>`concat('/regulator/pharmacies/', pharmacies.id::text)`

function baseQuery(trx: TrxOrDb) {
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
            'pharmacists.country',
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

export const isLicenceLike = (search: string) =>
  /^[A-Z]\d{2}-[A-Z]\d{4}-\d{4}$/.test(search.toUpperCase())

type SearchTerms = {
  country: string
  name_search: string | null
  licence_number_search: string | null
}

export const toSearchTerms = (
  country: string,
  search: string | null,
): SearchTerms => {
  if (!search) {
    return { country, name_search: null, licence_number_search: null }
  }
  if (isLicenceLike(search)) {
    return {
      country,
      name_search: null,
      licence_number_search: search.toUpperCase(),
    }
  }
  return { country, name_search: search, licence_number_search: null }
}

const model = base({
  top_level_table: 'pharmacies',
  baseQuery,
  formatResult(result): RenderedPharmacy {
    return result
  },
  handleSearch(qb, opts: SearchTerms) {
    if (opts.name_search) {
      qb = qb.where('pharmacies.name', 'ilike', `%${opts.name_search}%`)
    }
    if (opts.licence_number_search) {
      qb = qb.where(
        'pharmacies.licence_number',
        '=',
        opts.licence_number_search,
      )
    }
    return qb
  },
})

export const search = model.search
export const getById = model.getById
export const getByIds = model.getByIds

export function getByLicenceNumber(trx: TrxOrDb, licence_number: string) {
  return baseQuery(trx)
    .where('licence_number', '=', licence_number)
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
  country: string
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
