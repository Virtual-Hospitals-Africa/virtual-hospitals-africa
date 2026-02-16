import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'regulatory_agencies',
    (qb) =>
      qb
        .addColumn(
          'country',
          'varchar(2)',
          (col) => col.notNull().references('countries.iso_3166_2'),
        )
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('acronym', 'varchar(255)', (col) => col.notNull())
    // .addCheckConstraint(
    //   'organization_with_address_has_location',
    //   sql`
    //   (address_id IS NULL) = (location IS NULL)
    // `,
    // ),
  )
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.schema.dropTable('organization_departments').execute()
  await db.schema.dropTable('organizations').execute()
}
