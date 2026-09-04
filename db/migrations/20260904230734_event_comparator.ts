import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export function up(db: Kysely<DB>) {
  return db.schema.alterTable('patient_events')
    .addColumn('comparator', sql`comparator`, (col) => col.notNull().defaultTo('='))
    .execute()
}

export function down(db: Kysely<DB>) {
  return db.schema.alterTable('patient_events')
    .dropColumn('comparator')
    .execute()
}
