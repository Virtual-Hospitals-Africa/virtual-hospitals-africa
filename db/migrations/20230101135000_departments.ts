import { Kysely, sql } from 'kysely'
import { DEPARTMENT_DEFS } from '../../shared/departments.ts'
import entries from '../../util/entries.ts'
import { DB } from '../../db.d.ts'

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

  await db.insertInto('departments')
    .values(
      entries(DEPARTMENT_DEFS).map((
        [name, { requires_triage, workflows }],
      ) => ({ name, requires_triage, workflows })),
    )
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('departments').execute()
}
