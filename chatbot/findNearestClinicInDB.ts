import { sql } from 'kysely'
import { Clinic, LocationMessage, PatientState, TrxOrDb, Location } from "../types.ts";


export async function findNearestClinicInDB(
    trx: TrxOrDb,
    patientState: PatientState 
): Promise<
  Clinic[]
> {
    const locationMessage: LocationMessage = JSON.parse(patientState.body)

    const currentLocation: Location = {
        latitude: locationMessage.latitude,
        longitude: locationMessage.longitude
    }

    const result = await sql<Clinic>`
      SELECT name,
             location, 
             ST_Distance(
                location,
                ST_SetSRID(ST_MakePoint(${currentLocation.longitude}, ${currentLocation.latitude}), 4326)::geography
              ) AS distance
      FROM clinics
      WHERE ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(${currentLocation.longitude}, ${currentLocation.latitude}), 4326)::geography,
        50000
      )
      ORDER BY location <-> ST_SetSRID(ST_MakePoint(${currentLocation.longitude}, ${currentLocation.latitude}), 4326)::geography
    `.execute(trx)

    const clinics: Clinic[] = result.rows.map((row) => ({
        ...row
    }));

    return clinics
}




