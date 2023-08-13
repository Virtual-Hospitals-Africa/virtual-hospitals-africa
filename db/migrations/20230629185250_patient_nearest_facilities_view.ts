import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await sql`
  CREATE VIEW patient_nearest_facilities AS (
    WITH patients_with_location AS (
      SELECT id as patient_id, location
      FROM patients 
      WHERE location is not null
    ),

    patient_facility_results AS (
      SELECT facilities.*, 
             patients_with_location.patient_id as patient_id, 
             ST_Distance(patients_with_location.location, facilities.location) as distance, 
             ROW_NUMBER() OVER (
              PARTITION BY patients_with_location.patient_id 
              ORDER BY ST_Distance(patients_with_location.location, facilities.location)
             ) as row_number 
      FROM patients_with_location
      CROSS JOIN facilities
    ),

    facilities_with_admins AS (
      SELECT DISTINCT facility_id
      FROM employment
      WHERE employment.profession = 'admin'
    )

    SELECT patient_id,
           json_agg(json_build_object(
              'id', id,
              'name', name,
              'address', address,
              'longitude', ST_X(location::geometry),
              'latitude', ST_Y(location::geometry),
              'distance', distance,
              'vha', patient_facility_results.id IN (SELECT facility_id FROM facilities_with_admins)
            )) as nearest_facilities
    FROM patient_facility_results
    LEFT JOIN facilities_with_admins ON patient_facility_results.id = facilities_with_admins.facility_id
    WHERE patient_facility_results.row_number <= 10
    GROUP BY patient_id
  )
`.execute(db)

}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropView('patient_nearest_facilities').execute()
}
