import { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'regulators',
    (qb) =>
      qb.addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn(
          'country',
          'varchar(2)',
          (col) =>
            col.notNull().references('countries.iso_3166_2').onDelete(
              'cascade',
            ),
        )
        .addColumn('avatar_url', 'text'),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('regulators').execute()
}
