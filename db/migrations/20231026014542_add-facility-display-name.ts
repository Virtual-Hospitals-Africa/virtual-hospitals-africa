// deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import * as patient_nearest_facilities_migration from './20230629185250_patient_nearest_facilities_view.ts'

export async function up(db: Kysely<any>) {
  await sql`
    ALTER TABLE facilities ADD display_name TEXT GENERATED ALWAYS AS (name || ' ' || INITCAP(category)) STORED
  `.execute(db)

  await db.updateTable('facilities')
    .set({ 'name': 'VHA Test' })
    .where('id', '=', 1)
    .execute()

  await sql`DROP VIEW patient_nearest_facilities`.execute(db)

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
                'display_name', display_name,
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

export async function down(db: Kysely<any>) {
  await sql`DROP VIEW patient_nearest_facilities`.execute(db)

  await db.updateTable('facilities')
    .set({ 'name': 'VHA Test Hospital' })
    .where('id', '=', 1)
    .execute()

  await sql`
    ALTER TABLE facilities DROP COLUMN display_name
  `.execute(db)

  await patient_nearest_facilities_migration.up(db)
}
