import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'

export function up(db: Kysely<DB>) {
  return sql`CREATE EXTENSION IF NOT EXISTS POSTGIS;`.execute(db)
}

export function down(db: Kysely<DB>) {
  return sql`DROP EXTENSION POSTGIS CASCADE;`.execute(db)
}
