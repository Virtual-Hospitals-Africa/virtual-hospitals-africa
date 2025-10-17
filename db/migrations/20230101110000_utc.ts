import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'

export function up(db: Kysely<DB>) {
  sql`SET TIME ZONE 'UTC'`.execute(db)
}

export function down(_db: Kysely<unknown>) {
}
