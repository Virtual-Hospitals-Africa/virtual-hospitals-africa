import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createPointerTable, createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createType('profession')
    .asEnum([
      'admin',
      'doctor',
      'nurse',
      'receptionist',
    ])
    .execute()

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
        .addColumn(
          'profession',
          sql`profession`,
          (column) => column.notNull(),
        )
        .addColumn('specialty', 'varchar(255)')
        .addUniqueConstraint('only_employed_once_per_profession', [
          'health_worker_id',
          'organization_id',
          'profession',
        ]),
  )

  await createPointerTable(
    db,
    'organization_admins',
    {
      references: 'employment',
      primary_key_type: 'uuid',
    },
  )

  await createPointerTable(
    db,
    'receptionists',
    {
      references: 'employment',
      primary_key_type: 'uuid',
    },
  )

  await createPointerTable(
    db,
    'providers',
    {
      references: 'employment',
      primary_key_type: 'uuid',
    },
  )

  await createPointerTable(
    db,
    'doctors',
    {
      references: 'providers',
      primary_key_type: 'uuid',
    },
  )

  await createPointerTable(
    db,
    'nurses',
    {
      references: 'providers',
      primary_key_type: 'uuid',
    },
  )

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

  await createStandardTable(
    db,
    'health_worker_organization_calendars',
    (qb) =>
      qb.addColumn(
        'health_worker_id',
        'uuid',
        (col) =>
          col.notNull().references('health_workers.id').onDelete('cascade'),
      )
        .addColumn(
          'organization_id',
          'uuid',
          (col) =>
            col.notNull().references('organizations.id').onDelete('cascade'),
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
        )
        .addUniqueConstraint(
          'only_one_calendar_set_per_health_worker_organization',
          [
            'health_worker_id',
            'organization_id',
          ],
        ),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('health_worker_organization_calendars').execute()
  await db.schema.dropTable('department_employment').execute()
  await db.schema.dropTable('nurses').execute()
  await db.schema.dropTable('doctors').execute()
  await db.schema.dropTable('providers').execute()
  await db.schema.dropTable('receptionists').execute()
  await db.schema.dropTable('organization_admins').execute()
  await db.schema.dropTable('employment').execute()
  await db.schema.dropType('profession').execute()
}
