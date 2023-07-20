import { Kysely, sql } from 'kysely'

export function up(db: Kysely<unknown>) {
  return sql`CREATE EXTENSION IF NOT EXISTS POSTGIS;`.execute(db)
}

export function down(db: Kysely<unknown>) {
  return sql`DROP EXTENSION POSTGIS CASCADE;`.execute(db)
}
