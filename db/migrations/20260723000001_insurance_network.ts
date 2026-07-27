import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'insurance_network',
    (qb) =>
      qb
        .addColumn('business_name', 'varchar(255)', (col) => col.notNull())
        .addColumn('country', 'varchar(2)', (col) => col.notNull().references('countries.iso_3166_2'))
        .addColumn('address_id', 'uuid', (col) => col.references('addresses.id').onDelete('cascade'))
        .addColumn('location', sql`GEOGRAPHY(POINT,4326)`)
        .addColumn('avatar_media_id', 'uuid', (col) => col.references('media.id').onDelete('set null'))
        .addColumn('email', 'varchar(255)')
        .addColumn('telephone', 'varchar(20)')
        .addColumn('website', 'varchar(255)')
        .addColumn('business_registration_id', 'varchar(100)')
        .addColumn('network_code', 'varchar(50)')
        .addColumn('network_type', 'varchar(50)')
        .addColumn('claims_submission_email', 'varchar(255)')
        .addColumn('member_portal_url', 'varchar(255)')
        .addColumn('inactive_reason', 'varchar(255)'),
  )

  await db.schema
    .createIndex('idx_insurance_network_country')
    .on('insurance_network')
    .column('country')
    .execute()

  await db.schema
    .createIndex('idx_insurance_network_business_name')
    .on('insurance_network')
    .column('business_name')
    .execute()

  await db.schema
    .createIndex('idx_insurance_network_avatar_media_id')
    .on('insurance_network')
    .column('avatar_media_id')
    .execute()
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.schema.dropTable('insurance_network').execute()
}
