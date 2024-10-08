import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'organizations',
    (qb) =>
      qb.addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('category', 'varchar(255)')
        .addColumn('inactive_reason', 'varchar(255)')
        .addColumn('address_id', 'uuid', (col) => col.references('addresses.id').onDelete('cascade'))
        .addColumn('location', sql`GEOGRAPHY(POINT,4326)`)
        .addCheckConstraint('organization_with_address_has_location', sql`
          (address_id IS NULL) = (location IS NULL)
        `)
  )
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.schema.dropTable('organizations').execute()
}
