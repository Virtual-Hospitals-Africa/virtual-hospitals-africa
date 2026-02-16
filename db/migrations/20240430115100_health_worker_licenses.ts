import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createStandardTable } from '../createTable.ts'
import { now } from '../helpers.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(db, 'health_worker_licence_numbers', (qb) =>
    qb
      .addColumn('health_worker_id', 'uuid', (col) => col.notNull().references('health_workers.id').onDelete('cascade'))
      .addColumn('regulatory_agency_id', 'uuid', (col) => col.notNull().references('regulatory_agencies.id').onDelete('cascade'))
      .addColumn('licence_number', 'varchar(255)', (col) => col.notNull())
      .addUniqueConstraint('unique_licence_number_per_country_profession', ['regulatory_agency_id', 'licence_number']))

  await createStandardTable(
    db,
    'health_worker_licences',
    (qb) =>
      qb.addColumn('health_worker_licence_number_id', 'uuid', (col) => col.notNull().references('health_worker_licence_numbers.id').onDelete('cascade'))
        .addColumn('profession', 'varchar(255)', (col) => col.notNull())
        .addColumn('specialty', 'varchar(255)')
        .addColumn('subspecialty', 'varchar(255)')
        .addColumn('start_date', 'date', (col) => col.notNull())
        .addColumn('expiry_date', 'date', (col) => col.notNull())
        .addColumn('media_id', 'uuid', (col) => col.references('media.id').onDelete('cascade')),
  )

  await createStandardTable(db, 'health_worker_demographics', (qb) =>
    qb
      .addColumn('health_worker_id', 'uuid', (col) => col.notNull().references('health_workers.id').onDelete('cascade'))
      .addColumn('address_id', 'uuid', (col) => col.references('addresses.id').onDelete('cascade'))
      .addColumn('mobile_phone_number', 'varchar(255)')
      .addColumn('sex', sql`sex`, (col) => col.notNull())
      .addColumn('gender', 'varchar(255)', (col) => col.notNull()))

  await createStandardTable(db, 'health_worker_licence_revocations', (qb) =>
    qb
      .addColumn('health_worker_licence_id', 'uuid', (col) => col.notNull().references('health_worker_licences.id').onDelete('cascade'))
      .addColumn('reason', 'varchar(255)', (col) => col.notNull())
      .addColumn('revoked_at', 'timestamp', (col) => col.notNull().defaultTo(now))
      .addColumn(
        'revoked_by',
        'uuid',
        (col) => col.notNull().references('regulators.id').onDelete('cascade'),
      ))
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('health_worker_licence_revocations').execute()
  await db.schema.dropTable('health_worker_demographics').execute()
  await db.schema.dropTable('health_worker_licences').execute()
  await db.schema.dropTable('health_worker_licence_numbers').execute()
}
