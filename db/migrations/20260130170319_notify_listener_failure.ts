import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await sql`
    CREATE OR REPLACE FUNCTION notify_event_listener_failure()
    RETURNS TRIGGER AS $$
    DECLARE
      unprocessed_count integer;
    BEGIN
      IF OLD.error_message IS NULL AND NEW.error_message IS NOT NULL THEN
        PERFORM pg_notify('event_listener_failure', json_build_object(
          'id', NEW.id,
          'event_id', NEW.event_id,
          'listener_name', NEW.listener_name,
          'error_message', NEW.error_message
        )::text);
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db)

  await sql`
    CREATE TRIGGER event_listener_failure_trigger
    AFTER UPDATE ON event_listeners
    FOR EACH ROW
    EXECUTE FUNCTION notify_event_listener_failure();
  `.execute(db)
}

export async function down(db: Kysely<DB>) {
  await sql`DROP TRIGGER IF EXISTS event_listener_failure_trigger ON event_listeners`.execute(db)
  await sql`DROP FUNCTION IF EXISTS notify_event_listener_failure`.execute(db)
}
