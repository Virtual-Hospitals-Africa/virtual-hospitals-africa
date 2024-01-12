import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('suburbs')
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
    .addColumn('ward_id', 'integer', (col) =>
      col.notNull()
        .references('wards.id')
        .onDelete('cascade'))
    .addUniqueConstraint('suburb_name', ['name', 'ward_id'])
    .execute()

  await addUpdatedAtTrigger(db, 'suburbs')
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .dropTable('suburbs').execute()
}
