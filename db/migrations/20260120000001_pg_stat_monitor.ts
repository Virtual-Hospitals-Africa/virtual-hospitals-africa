import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<DB>) {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS pg_stat_monitor;`.execute(db)
  } catch (_err) {
    // pg_stat_monitor is helpful for local debugging, but not strictly necessary
  }
}

export function down(db: Kysely<DB>) {
  return sql`DROP EXTENSION IF EXISTS pg_stat_monitor;`.execute(db)
}
