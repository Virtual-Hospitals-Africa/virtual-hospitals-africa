import type { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'employment',
    (qb) =>
      qb.addColumn('health_worker_id', 'uuid', (col) =>
        col.notNull()
          .references('health_workers.id')
          .onDelete('cascade'))
        .addColumn('organization_id', 'uuid', (col) =>
          col.notNull()
            .references('organizations.id')
            .onDelete('cascade'))
        .addColumn('is_admin', 'boolean', (col) => col.notNull())
        .addUniqueConstraint('only_employed_once_per_organization', [
          'health_worker_id',
          'organization_id',
        ]),
  )

  await db.schema
    .createIndex('idx_employment_organization_id')
    .on('employment')
    .column('organization_id')
    .execute()

  await db.schema
    .createIndex('idx_employment_health_worker_id')
    .on('employment')
    .column('health_worker_id')
    .execute()

  await createStandardTable(
    db,
    'department_employment',
    (qb) =>
      qb.addColumn('employment_id', 'uuid', (col) =>
        col.notNull()
          .references('employment.id')
          .onDelete('cascade'))
        .addColumn('department_id', 'uuid', (col) =>
          col.notNull()
            .references('organization_departments.id')
            .onDelete('cascade'))
        .addUniqueConstraint('only_in_department_once', [
          'employment_id',
          'department_id',
        ]),
  )

  await db.schema
    .createIndex('idx_department_employment_department_id')
    .on('department_employment')
    .column('department_id')
    .execute()

  await createStandardTable(
    db,
    'employment_calendars',
    (qb) =>
      qb.addColumn(
        'employment_id',
        'uuid',
        (col) =>
          col.notNull().references('employment.id').unique().onDelete(
            'cascade',
          ),
      )
        .addColumn(
          'gcal_appointments_calendar_id',
          'varchar(255)',
          (col) => col.notNull(),
        )
        .addColumn(
          'gcal_availability_calendar_id',
          'varchar(255)',
          (col) => col.notNull(),
        )
        .addColumn(
          'availability_set',
          'boolean',
          (col) => col.notNull().defaultTo(false),
        ),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('employment_calendars').execute()
  await db.schema.dropTable('department_employment').execute()
  await db.schema.dropTable('nurses').execute()
  await db.schema.dropTable('doctors').execute()
  await db.schema.dropTable('providers').execute()
  await db.schema.dropTable('pharmacists').execute()
  await db.schema.dropTable('organization_admins').execute()
  await db.schema.dropTable('employment').execute()
}
