import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'organizations',
    (qb) =>
      qb.addColumn('name', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('category', 'varchar(255)')
        .addColumn('ownership', 'varchar(255)')
        .addColumn('inactive_reason', 'varchar(255)')
        .addColumn(
          'is_test',
          'boolean',
          (col) => col.notNull().defaultTo(false),
        )
        .addColumn(
          'country',
          'varchar(2)',
          (col) => col.notNull().references('countries.iso_3166_2'),
        )
        .addColumn(
          'address_id',
          'uuid',
          (col) => col.references('addresses.id').onDelete('cascade'),
        )
        .addColumn('location', sql`GEOGRAPHY(POINT,4326)`)
        .addColumn(
          'most_common_language_code',
          'varchar(3)',
          (col) => col.references('languages.iso_639_2_b'),
        ),
    // .addCheckConstraint(
    //   'organization_with_address_has_location',
    //   sql`
    //   (address_id IS NULL) = (location IS NULL)
    // `,
    // ),
  )

  await createStandardTable(
    db,
    'organization_departments',
    (qb) =>
      qb
        .addColumn('organization_id', 'uuid', (col) =>
          col.notNull().references('organizations.id').onDelete('cascade'))
        .addColumn('name', 'varchar(255)', (col) =>
          col.notNull().references('departments.name'))
        .addColumn('inactive_reason', 'varchar(255)')
        .addColumn(
          'address_id',
          'uuid',
          (col) =>
            col.references('addresses.id').onDelete('cascade'),
        )
        .addColumn('location', sql`GEOGRAPHY(POINT,4326)`)
        .addUniqueConstraint('organization_department_name', [
          'organization_id',
          'name',
        ]),
  )
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.schema.dropTable('organization_departments').execute()
  await db.schema.dropTable('organizations').execute()
}
