import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('employment_table')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('hcw_id', 'integer', (col) =>
      col.notNull()
        .references('health_workers.id')
        .onDelete('cascade'))
    .addColumn('clinic_id', 'integer', (col) =>
      col.notNull()
        .references('clinics.id')
        .onDelete('cascade'))
    .addColumn('profession', 'text', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('health_workers').execute()
}
