import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { Coordinates, Maybe, TrxOrDb } from '../../types.ts'
import { jsonArrayFrom, jsonBuildObject } from '../helpers.ts'
import { base, SearchResult } from './_base.ts'
import { employees } from './employees.ts'

export type SearchOpts = {
  location: Coordinates
  excluding_id?: string
  search?: Maybe<string>
  kind?: 'hospital'
  limit?: number
  has_doctors?: boolean
}

export type NearestOrganizationSearchResult = SearchResult<
  typeof nearest_organizations
>

function baseQuery(
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
      'addresses.locality',
      jsonBuildObject({
        longitude: sql<number>`ST_X(location::geometry)`,
        latitude: sql<number>`ST_Y(location::geometry)`,
      }).as('location'),
      distance_sql.as('distance_meters'),
      sql<string>`'https://maps.google.com'`.as('google_maps_link'),
      sql<string>`'Open'`.as('status'),
      jsonArrayFrom(
        employees.baseQuery(trx)
          .where('employment.is_admin', '=', true)
          .where('employment.organization_id', '=', eb.ref('organizations.id')),
      ).as('admins'),
      jsonArrayFrom(
        employees.baseQuery(trx)
          .where('employment.profession', '=', 'doctor')
          .where('employment.organization_id', '=', eb.ref('organizations.id')),
      ).as('doctors'),
      jsonArrayFrom(
        eb.selectFrom('organization_departments')
          .innerJoin(
            'departments',
            'departments.name',
            'organization_departments.name',
          )
          .select([
            'organization_departments.id',
            'organization_departments.name',
            'departments.requires_triage',
          ])
          .whereRef(
            'organization_departments.organization_id',
            '=',
            'organizations.id',
          ),
      ).as('departments'),
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

type Wait = {
  status: 'open (short wait)'
  minutes: number
  display: string
} | {
  status: 'open (long wait)'
  minutes: number
  display: string
} | {
  status: 'closing soon'
  minutes: number
  display: string
} | {
  status: 'closed'
}

function randomWait(): Wait {
  const seed = Math.random()
  if (seed < .7) {
    return {
      status: 'open (short wait)',
      minutes: 57,
      display: '1 hour',
    }
  }
  if (seed < .8) {
    return {
      status: 'open (long wait)',
      minutes: 235,
      display: '4 hours',
    }
  }
  if (seed < .9) {
    return {
      status: 'closing soon',
      minutes: 110,
      display: '2 hours',
    }
  }
  return {
    status: 'closed',
  }
}

export const nearest_organizations = base({
  top_level_table: 'organizations',
  baseQuery,
  formatResult: (organization) => ({
    ...organization,
    business_hours: 'M-F 9am-5pm',
    wait: randomWait(),
    re_opens: {
      display: 'Reopens tomorrow 9am',
    },
  }),
})
