import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'

export function up(db: Kysely<DB>) {
  return sql`
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `.execute(db)
}

export function down(db: Kysely<DB>) {
  return sql`DROP FUNCTION update_updated_at;`.execute(db)
}
