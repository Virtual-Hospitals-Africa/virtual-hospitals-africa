import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(
    db,
    'media',
    (qb) =>
      qb
        .addColumn('mime_type', 'varchar(255)', (col) => col.notNull())
        .addColumn('binary_data', 'bytea', (col) => col.notNull())
        .addColumn(
          'uuid',
          'uuid',
          (column) =>
            column.notNull().unique().defaultTo(sql`gen_random_uuid()`),
        ),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('media').execute()
}
