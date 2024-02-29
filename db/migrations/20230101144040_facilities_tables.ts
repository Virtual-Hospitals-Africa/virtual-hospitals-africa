import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('facilities')
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
    .addColumn('location', sql`GEOGRAPHY(POINT,4326)`)
    .addColumn('address', 'text')
    .addColumn('category', 'varchar(255)', (col) => col.notNull())
    .addColumn('phone', 'varchar(255)')
    // TODO: Link with address table
    .addCheckConstraint(
      'address_and_location',
      sql`
      (address IS NOT NULL AND location IS NOT NULL) OR
      (address IS NULL AND location IS NULL)
    `,
    )
    .addCheckConstraint(
      'no_address_is_virtual',
      sql`
      (address IS NOT NULL) OR
      (category LIKE 'Virtual%')
    `,
    )
    .execute()

  await addUpdatedAtTrigger(db, 'facilities')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('facilities').execute()
}
