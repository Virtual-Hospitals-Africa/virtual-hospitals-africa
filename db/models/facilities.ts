import { sql } from 'kysely'
import { Facility, Location, ReturnedSqlRow, TrxOrDb } from '../../types.ts'

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
