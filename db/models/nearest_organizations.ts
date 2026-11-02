import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { Coordinates, RenderedOrganization, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, SearchResult } from './_base.ts'
import { organizations, OrganizationSearch } from './organizations.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { LRU } from 'tiny-lru'
import db from '../db.ts'

export type SearchOpts = OrganizationSearch & {
  location: Coordinates
  excluding_id?: string
}

export type NearestOrganization = RenderedOrganization & {
  location: Coordinates
  locality: string
  formatted_address: string
  distance_meters: number
  google_maps_link: string
}

export type NearestOrganizationSearchResult = SearchResult<
  typeof nearest_organizations
>

export const nearest_organizations = base({
  top_level_table: 'organizations',
  baseQuery(
    trx: TrxOrDbOrQueryCreator,
    search: SearchOpts,
  ) {
    assert(search?.location, 'Must provide a location to measure distance from')

    const distance_sql = sql<
      number
    >`organizations.location <-> ST_SetSRID(ST_MakePoint(${search.location.longitude}, ${search.location.latitude}), 4326)::geography`

    return organizations.baseQuery(trx, search)
      .where('inactive_reason', 'is', null)
      .where('location', 'is not', null)
      .select([
        'addresses.locality',
        distance_sql.as('distance_meters'),
        sql<string>`'https://maps.google.com'`.as('google_maps_link'),
        sql<string>`'Open'`.as('status'),
      ])
      .orderBy(
        distance_sql,
        'asc',
      )
  },
  formatResult(organization): NearestOrganization {
    assertHasProperty(organization, 'location')
    assertHasProperty(organization, 'locality')
    assertHasProperty(organization, 'formatted_address')
    return organization
  },
  nearestHospital,
  // formatResult: (organization) => ({
  //   ...organization,
  //   business_hours: 'M-F 9am-5pm',
  //   wait: randomWait(),
  //   re_opens: {
  //     display: 'Reopens tomorrow 9am',
  //   },
  // }),
})

const lru = new LRU<NearestOrganization>(100)

async function nearestHospital(organization: { id: string; location: Coordinates | null }): Promise<NearestOrganization | null> {
  if (!organization.location) return null
  if (lru.has(organization.id)) return lru.get(organization.id)!
  const result = await nearest_organizations.findFirst(
    db,
    {
      is_hospital: true,
      location: organization.location,
      excluding_id: organization.id,
    },
  )
  lru.set(organization.id, result)
  return result ?? null
}
