import { sql } from 'kysely'
import {
  Clinic,
  Location,
  LocationMessage,
  PatientState,
  TrxOrDb,
} from '../types.ts'

async function findNearestClinicInDB(
  trx: TrxOrDb,
  patientState: PatientState,
): Promise<
  Clinic[]
> {
  const locationMessage: LocationMessage = JSON.parse(patientState.body)

  const currentLocation: Location = {
    latitude: locationMessage.latitude,
    longitude: locationMessage.longitude,
  }

  const result = await sql<Clinic>`
      SELECT name,
             location, 
             ST_Distance(
                location,
                ST_SetSRID(ST_MakePoint(${currentLocation.longitude}, ${currentLocation.latitude}), 4326)::geography
              ) AS distance
      FROM clinics
      ORDER BY location <-> ST_SetSRID(ST_MakePoint(${currentLocation.longitude}, ${currentLocation.latitude}), 4326)::geography
      LIMIT 10
    `.execute(trx)

  const clinics: Clinic[] = result.rows.map((row) => ({
    name: row.name,
    location: row.location,
    distance: row.distance,
  }))

  return clinics
}

export async function getNearestClinics(
  trx: TrxOrDb,
  patientState: PatientState,
): Promise<Clinic[]> {
  const clinics = await findNearestClinicInDB(trx, patientState)
  return clinics
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
