import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('health_worker_professions')
    .asEnum([
      'admin',
      'doctor',
      'nurse',
    ])
    .execute()

  await db.schema
    .createTable('employment')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('health_worker_id', 'integer', (col) =>
      col.notNull()
        .references('health_workers.id')
        .onDelete('cascade'))
    .addColumn('clinic_id', 'integer', (col) =>
      col.notNull()
        .references('clinics.id')
        .onDelete('cascade'))
    .addColumn(
      'profession',
      sql`health_worker_professions`,
      (column) => column.notNull(),
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('employment').execute()
  await db.schema.dropType('health_worker_professions').execute()
}
