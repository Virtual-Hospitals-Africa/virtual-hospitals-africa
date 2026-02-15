import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.createType('comparator')
    .asEnum(['=', '>', '<', '>=', '<='])
    .execute()

  await db.schema.alterTable('patient_measurements')
    .addColumn('comparator', sql`comparator`, (col) => col.notNull().defaultTo('='))
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.alterTable('patient_measurements').dropColumn('comparator').execute()
  await db.schema.dropType('comparator').execute()
}
