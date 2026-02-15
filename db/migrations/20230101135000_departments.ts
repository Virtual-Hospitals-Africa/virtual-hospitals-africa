import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.createTable('departments')
    .addColumn('name', 'varchar(255)', (col) => col.primaryKey())
    .addColumn(
      'requires_triage',
      'boolean',
      (col) => col.notNull().defaultTo(false),
    )
    .addColumn(
      'workflows',
      sql`workflow[]`,
      (col) => col.notNull(),
    )
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('departments').execute()
}
