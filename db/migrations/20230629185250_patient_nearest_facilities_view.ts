import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await sql`
    CREATE VIEW patient_nearest_facilities AS

        SELECT patient_id,
              json_agg(json_build_object(
                  'id', id,
                  'name', name,
                  'address', address,
                  'longitude', ST_X(location::geometry),
                  'latitude', ST_Y(location::geometry),
                  'distance', distance
              )) as nearest_facilities
        FROM (SELECT facilities.*, location.patient_id as patient_id,
                    ST_Distance(
                        location.location,
                        facilities.location
                    ) as distance,
                    ROW_NUMBER() OVER (PARTITION BY location.patient_id ORDER BY ST_Distance(location.location, facilities.location)) as row_number
              FROM (SELECT  DISTINCT ON (patient_id)
                            patient_id,
                            ST_MakePoint(
                                        CAST(body::json ->> 'longitude' AS double precision),
                                        CAST(body::json ->> 'latitude' AS double precision)
                            )::geography AS location
                      FROM whatsapp_messages_received
                      WHERE conversation_state = 'find_nearest_facility:share_location'
                      ORDER BY patient_id, updated_at DESC
                    ) AS location
              CROSS JOIN facilities
              ) AS subq
        WHERE subq.row_number <= 10
        GROUP BY patient_id
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropView('patient_nearest_facilities').execute()
}
