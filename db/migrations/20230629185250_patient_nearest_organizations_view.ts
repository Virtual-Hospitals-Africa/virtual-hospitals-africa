import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('patient_whatsapp_reported_location')
    .addColumn(
      'patient_id',
      'uuid',
      (col) => col.primaryKey().notNull().references('Patient.id'),
    )
    .addColumn('location', sql`GEOGRAPHY(POINT,4326)`, (col) => col.notNull())
    .execute()

  await sql`
    CREATE OR REPLACE VIEW patient_nearest_organizations AS (
      WITH patient_organization_location_results AS (
        SELECT "Location".*,
              patient_whatsapp_reported_location.patient_id as patient_id,
              ST_Distance(
                patient_whatsapp_reported_location.location,
                "Location".location
              ) as distance,
              ROW_NUMBER() OVER (
                PARTITION BY patient_whatsapp_reported_location.patient_id
                ORDER BY ST_Distance(
                  patient_whatsapp_reported_location.location,
                  "Location".location
                )
              ) as row_number
        FROM patient_whatsapp_reported_location
        CROSS JOIN "Location"
        WHERE "Location"."organizationId" IS NOT NULL
      ),

      organizations_with_admins AS (
        SELECT DISTINCT organization_id
        FROM employment
        WHERE employment.profession = 'admin'
      )

      SELECT patient_id,
            json_agg(json_build_object(
                'organization_id', "Organization".id,
                'location_id', "patient_organization_location_results".id,
                'organization_name', "Organization"."canonicalName",
                'address', "Address".address,
                'longitude', ST_X("patient_organization_location_results".location::geometry),
                'latitude', ST_Y("patient_organization_location_results".location::geometry),
                'distance', distance,
                'vha', patient_organization_location_results.id IN (SELECT organization_id FROM organizations_with_admins)
              )) as nearest_organizations
      FROM patient_organization_location_results
      JOIN "Organization" on "patient_organization_location_results"."organizationId" = "Organization"."id"
      JOIN "Address" on "patient_organization_location_results"."id" = "Address"."resourceId"
      LEFT JOIN organizations_with_admins ON patient_organization_location_results.id = organizations_with_admins.organization_id
      WHERE patient_organization_location_results.row_number <= 10
      GROUP BY patient_id
    )
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropView('patient_nearest_organizations').execute()
  await db.schema.dropTable('patient_whatsapp_reported_location').execute()
}
