import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(db, 'organizations', (qb) =>
    qb
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
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('organizations').execute()
}
