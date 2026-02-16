import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createStandardTable } from '../createTable.ts'
import { now } from '../helpers.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(db, 'health_worker_licences', (qb) =>
    qb
      .addColumn('health_worker_id', 'uuid', (col) => col.notNull().references('health_workers.id').onDelete('cascade'))
      .addColumn('country', 'varchar(2)', (col) => col.notNull().references('countries.iso_3166_2'))
      .addColumn('profession', sql`profession`, (col) => col.notNull())
      .addColumn('licence_number', 'varchar(255)', (col) => col.notNull())
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('address_id', 'uuid', (col) => col.references('addresses.id').onDelete('cascade'))
      .addColumn('mobile_phone_number', 'varchar(255)')
      .addColumn('sex', sql`sex`, (col) => col.notNull())
      .addColumn('gender', 'varchar(255)', (col) => col.notNull())
      .addColumn('expiry_date', 'date', (col) => col.notNull())
      .addColumn('media_id', 'uuid', (col) => col.references('media.id').onDelete('cascade'))
      .addUniqueConstraint('unique_licence_number_per_country_profession', ['country', 'profession', 'licence_number']))

  await createStandardTable(db, 'health_worker_licence_revocations', (qb) =>
    qb
      .addColumn('health_worker_licence_id', 'uuid', (col) => col.notNull().references('health_worker_licences.id').onDelete('cascade'))
      .addColumn('revoked_at', 'timestamp', (col) => col.notNull().defaultTo(now))
      .addColumn(
        'revoked_by',
        'uuid',
        (col) => col.notNull().references('regulators.id').onDelete('cascade'),
      ))
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('health_worker_licence_revocations').execute()
  await db.schema.dropTable('health_worker_licences').execute()
}
