import { Kysely, sql } from 'kysely'

export function up(db: Kysely<unknown>) {
  return sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`.execute(db)
}

export function down(db: Kysely<unknown>) {
  return sql`DROP EXTENSION pg_trgm;`.execute(db)
}
