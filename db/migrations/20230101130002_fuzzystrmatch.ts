import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'

// https://www.postgresql.org/docs/current/fuzzystrmatch.html
export function up(db: Kysely<DB>) {
  return sql`CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;`.execute(db)
}

export function down(db: Kysely<DB>) {
  return sql`DROP EXTENSION fuzzystrmatch CASCADE;`.execute(db)
}
