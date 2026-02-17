import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'

export function up(db: Kysely<DB>) {
  return sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`.execute(db)
}

export function down(db: Kysely<DB>) {
  return sql`DROP EXTENSION pg_trgm;`.execute(db)
}
