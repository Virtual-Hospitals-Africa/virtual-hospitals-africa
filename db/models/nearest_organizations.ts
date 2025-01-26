import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { Location, Maybe, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom, jsonBuildObject } from '../helpers.ts'
import { base, SearchResult } from './_base.ts'

export type SearchOpts = {
  location: Location
  excluding_id?: string
  search?: Maybe<string>
  kind?: 'hospital'
  limit?: number
  has_doctors?: boolean
}

export function baseQuery(
  trx: TrxOrDb,
  search: SearchOpts,
) {
  assert(search?.location, 'Must provide a location to measure distance from')

  const distance_sql = sql<
    number
  >`organizations.location <-> ST_SetSRID(ST_MakePoint(${search.location.longitude}, ${search.location.latitude}), 4326)::geography`

  return trx.selectFrom('organizations')
    .innerJoin('addresses', 'address_id', 'addresses.id')
    .where('inactive_reason', 'is', null)
    .where('location', 'is not', null)
    .select((eb) => [
      'organizations.id',
      'organizations.name',
      'organizations.category',
      'addresses.formatted as address',
      jsonBuildObject({
        longitude: sql<number>`ST_X(location::geometry)`,
        latitude: sql<number>`ST_Y(location::geometry)`,
      }).as('location'),
      distance_sql.as('distance_meters'),
      sql<string>`'https://maps.google.com'`.as('google_maps_link'),
      sql<string>`'Open'`.as('status'),
      jsonArrayFrom(
        eb.selectFrom('employment')
          .innerJoin(
            'health_workers',
            'employment.health_worker_id',
            'health_workers.id',
          )
          .select([
            'health_workers.name',
            'health_workers.avatar_url',
          ])
          .whereRef(
            'employment.organization_id',
            '=',
            'organizations.id',
          )
          .where('employment.profession', '=', 'doctor'),
      ).as('doctors'),
    ])
    .$if(
      search.kind === 'hospital',
      (qb) => qb.where('category', 'ilike', '%hospital%'),
    )
    .$if(
      !!search.search,
      (qb) => qb.where('organizations.name', 'ilike', `%${search.search}%`),
    )
    .$if(
      !!search.excluding_id,
      (qb) => qb.where('organizations.id', '!=', search.excluding_id!),
    )
    .$if(
      !!search.has_doctors,
      (qb) =>
        qb.where(
          (eb) =>
            eb.selectFrom('employment as doctor_employment')
              .whereRef(
                'doctor_employment.organization_id',
                '=',
                'organizations.id',
              )
              .where('doctor_employment.profession', '=', 'doctor')
              .select((eb2) =>
                eb2.fn.count('doctor_employment.id').as('doctor_count')
              ),
          '>',
          0,
        ),
    )
    .orderBy(
      distance_sql,
    )
    .limit(search?.limit || 5)
}

const model = base({
  top_level_table: 'organizations',
  baseQuery,
  formatResult: (x) => x,
})

export type NearestOrganizationSearchResult = SearchResult<typeof model>

export const search = model.search
export const getById = model.getById
export const getByIds = model.getByIds
