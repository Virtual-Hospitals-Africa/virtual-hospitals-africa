import type { Kysely } from 'kysely'
import type { DB } from '../../db.d.ts'
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
        .addColumn('acronym', 'varchar(255)', (col) => col.notNull()),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('regulatory_agencies').execute()
}
