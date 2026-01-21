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
        .addColumn('avatar_media_id', 'uuid', (col) => col.references('media.id').onDelete('set null')),
  )

  await db.schema
    .createIndex('idx_regulators_country')
    .on('regulators')
    .column('country')
    .execute()

  await db.schema
    .createIndex('idx_regulators_avatar_media_id')
    .on('regulators')
    .column('avatar_media_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('regulators').execute()
}
