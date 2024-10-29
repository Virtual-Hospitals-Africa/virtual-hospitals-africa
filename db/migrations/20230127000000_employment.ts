import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('profession')
    .asEnum([
      'admin',
      'doctor',
      'nurse',
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
        .addUniqueConstraint('only_employed_once_per_profession', [
          'health_worker_id',
          'organization_id',
          'profession',
        ]),
  )

  await createStandardTable(
    db,
    'provider_calendars',
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

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('provider_calendars').execute()
  await db.schema.dropTable('employment').execute()
  await db.schema.dropType('profession').execute()
}
