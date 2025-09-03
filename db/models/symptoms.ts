import { sql } from 'kysely'
import { jsonArrayFrom, jsonBuildObject } from '../helpers.ts'
import { addressDisplaySql, nameSql } from './pharmacists.ts'
import { RenderedPharmacy } from '../../types.ts'
import { TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'

// findings that interpret function

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
      'pharmacies.country',
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
            >`'/regulator/' || pharmacies.country || '/pharmacists/' || pharmacy_employment.pharmacist_id`
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

type SearchTerms = {
  country: string
  name_search: string | null
  licence_number_search: string | null
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
    if (opts.country) {
      qb = qb.where('pharmacies.country', '=', opts.country)
    }
    return qb
  },
})

export const search = model.search
export const getById = model.getById
export const getByIds = model.getByIds
