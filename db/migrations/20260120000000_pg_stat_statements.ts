import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'

// Enable pg_stat_statements for query performance monitoring
// https://www.postgresql.org/docs/current/pgstatstatements.html
export function up(db: Kysely<DB>) {
  return sql`CREATE EXTENSION IF NOT EXISTS pg_stat_statements;`.execute(db)
}

export function down(db: Kysely<DB>) {
  return sql`DROP EXTENSION pg_stat_statements CASCADE;`.execute(db)
}
