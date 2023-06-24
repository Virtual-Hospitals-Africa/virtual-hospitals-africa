import { sql } from 'kysely'
import { Clinic, Location, ReturnedSqlRow, TrxOrDb } from '../../types.ts'

export async function nearest(
  trx: TrxOrDb,
  location: Location,
): Promise<ReturnedSqlRow<Clinic>[]> {
  const result = await sql<ReturnedSqlRow<Clinic>>`
      SELECT *,
             ST_Distance(
                  location,
                  ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
              ) AS distance
        FROM clinics
    ORDER BY location <-> ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
       LIMIT 10
  `.execute(trx)

  return result.rows
}
