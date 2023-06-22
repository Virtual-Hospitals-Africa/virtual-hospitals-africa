import { sql } from 'kysely'
import { Clinic, ReturnedSqlRow, TrxOrDb } from '../../types.ts'

export async function nearest(
  trx: TrxOrDb,
  coords: { latitude: number; longitude: number },
): Promise<ReturnedSqlRow<Clinic>[]> {
  const result = await sql<ReturnedSqlRow<Clinic>>`
      SELECT *,
             ST_Distance(
                  location,
                  ST_SetSRID(ST_MakePoint(${coords.longitude}, ${coords.latitude}), 4326)::geography
              ) AS distance
        FROM clinics
    ORDER BY location <-> ST_SetSRID(ST_MakePoint(${coords.longitude}, ${coords.latitude}), 4326)::geography
       LIMIT 10
  `.execute(trx)

  return result.rows
}

/***
 * for testing
export async function getNearestClinicNames(
  trx: TrxOrDb,
  patientState: PatientState
): Promise<string> {
  const clinics = await findNearestClinicInDB(trx, patientState);
  return clinics.map((clinic) => clinic.name).join(', ');
}
*/
