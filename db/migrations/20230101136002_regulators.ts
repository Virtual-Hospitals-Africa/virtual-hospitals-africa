import type { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'regulators',
    (qb) =>
      qb.addColumn('regulatory_agency_id', 'uuid', (col) => col.notNull().references('regulatory_agencies.id').onDelete('cascade'))
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('avatar_media_id', 'uuid', (col) => col.references('media.id').onDelete('set null')),
  )

  await db.schema
    .createIndex('idx_regulators_regulatory_agency_id')
    .on('regulators')
    .column('regulatory_agency_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('regulators').execute()
}
