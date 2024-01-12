import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('districts')
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
    .addColumn('province_id', 'integer', (col) =>
      col.notNull()
        .references('provinces.id')
        .onDelete('cascade'))
    .addUniqueConstraint('district_name', ['name', 'province_id'])
    .execute()

  await addUpdatedAtTrigger(db, 'districts')
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .dropTable('districts').execute()
}
