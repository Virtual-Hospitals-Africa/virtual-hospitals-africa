import { sql } from 'kysely'
import { assert } from 'std/testing/asserts.ts'
import {
  Facility,
  Location,
  Maybe,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import haveNames from '../../util/haveNames.ts'

export async function nearest(
  trx: TrxOrDb,
  location: Location,
): Promise<ReturnedSqlRow<Facility>[]> {
  const result = await sql<ReturnedSqlRow<Facility>>`
      SELECT *,
             ST_Distance(
                  location,
                  ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
              ) AS distance,
              ST_X(location::geometry) as longitude,
              ST_Y(location::geometry) as latitude
        FROM facilities
    ORDER BY location <-> ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
       LIMIT 10
  `.execute(trx)

  return result.rows
}

export async function getAllWithNames(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<ReturnedSqlRow<Facility>[]> {
  let query = trx
    .selectFrom('facilities')
    .selectAll()
    .where('name', 'is not', null)

  if (search) query = query.where('name', 'ilike', `%${search}%`)

  const facilities = await query.execute()

  assert(haveNames(facilities))

  return facilities
}
