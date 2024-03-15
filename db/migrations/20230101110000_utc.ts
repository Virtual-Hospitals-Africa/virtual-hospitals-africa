import { Kysely, sql } from 'kysely'

export function up(db: Kysely<unknown>) {
  sql`SET TIME ZONE 'UTC'`.execute(db)
}

export function down(_db: Kysely<unknown>) {
}
