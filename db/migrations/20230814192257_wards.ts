import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('wards')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('district_id', 'integer', (col) =>
      col.notNull()
        .references('districts.id')
        .onDelete('cascade'))
    .addUniqueConstraint('ward_name', ['name', 'district_id'])
    .execute()

  await addUpdatedAtTrigger(db, 'wards')
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .dropTable('wards').execute()
}
