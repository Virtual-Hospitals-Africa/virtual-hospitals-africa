import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { Location, Maybe, TrxOrDb } from '../../types.ts'
import { jsonBuildObject } from '../helpers.ts'
import { base } from './_base.ts'

export type SearchOpts = {
  location: Location
  search?: Maybe<string>
  kind?: 'hospital'
  limit?: number
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
    .select([
      'organizations.id',
      'organizations.name',
      'organizations.category',
      'addresses.formatted as address',
      jsonBuildObject({
        longitude: sql<number>`ST_X(location::geometry)`,
        latitude: sql<number>`ST_Y(location::geometry)`,
      }).as('location'),
      distance_sql.as('distance_meters'),
    ])
    .$if(
      search.kind === 'hospital',
      (qb) => qb.where('category', 'ilike', '%hospital%'),
    )
    .$if(
      !!search.search,
      (qb) => qb.where('organizations.name', 'ilike', `%${search.search}%`),
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

export const search = model.search
export const getById = model.getById
export const getByIds = model.getByIds
