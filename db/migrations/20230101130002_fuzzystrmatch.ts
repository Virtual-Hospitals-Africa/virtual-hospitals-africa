import { Kysely, sql } from 'kysely'

// https://www.postgresql.org/docs/current/fuzzystrmatch.html
export function up(db: Kysely<unknown>) {
  return sql`CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;`.execute(db)
}

export function down(db: Kysely<unknown>) {
  return sql`DROP EXTENSION fuzzystrmatch CASCADE;`.execute(db)
}
