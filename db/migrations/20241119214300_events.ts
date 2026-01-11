import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(db, 'events', (qb) =>
    qb
      .addColumn('type', 'varchar(255)', (col) => col.notNull())
      .addColumn('data', 'jsonb', (col) => col.notNull())
      .addColumn('error_message_no_automated_retry', 'text')
      .addColumn('listeners_inserted_at', 'timestamptz')
      .addColumn('all_processed_at', 'timestamptz'))

  await createStandardTable(db, 'event_listeners', (qb) =>
    qb
      .addColumn('event_id', 'uuid', (col) =>
        col.notNull().references('events.id'))
      .addColumn('listener_name', 'varchar(255)', (col) =>
        col.notNull())
      .addColumn('error_message', 'text')
      .addColumn('error_count', 'integer', (col) =>
        col.notNull().defaultTo(0))
      .addColumn('backoff_until', 'timestamptz')
      .addColumn('processed_at', 'timestamptz')
      .addUniqueConstraint('single_listener', ['event_id', 'listener_name']))

  await sql`
      CREATE OR REPLACE FUNCTION check_event_all_processed_on_event_listener_processed()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Only fire when processed_at is set (was null, now not null)
        IF OLD.processed_at IS NULL AND NEW.processed_at IS NOT NULL THEN
          UPDATE events
            SET all_processed_at = now()
          WHERE NOT EXISTS (
            SELECT event_listeners.id
              FROM event_listeners
             WHERE event_listeners.processed_at IS NULL
               AND event_listeners.event_id = NEW.event_id
               AND event_listeners.id != NEW.event_id
          );

          PERFORM pg_notify('event_all_processed', NEW.event_id::text);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `.execute(db)

  await sql`
    CREATE TRIGGER event_listener_processed_trigger
    AFTER UPDATE ON event_listeners
    FOR EACH ROW
    EXECUTE FUNCTION check_event_all_processed_on_event_listener_processed();
  `.execute(db)

  // await sql`
  //   CREATE OR REPLACE FUNCTION notify_event_all_processed()
  //   RETURNS TRIGGER AS $$
  //   BEGIN
  //     IF OLD.all_processed_at IS NULL AND NEW.all_processed_at IS NOT NULL THEN

  //     END IF;
  //     RETURN NEW;
  //   END;
  //   $$ LANGUAGE plpgsql;
  // `.execute(db)

  // await sql`
  //   CREATE TRIGGER event_all_processed_trigger
  //   AFTER UPDATE ON events
  //   FOR EACH ROW
  //   EXECUTE FUNCTION notify_event_all_processed();
  // `.execute(db)
}

export async function down(db: Kysely<DB>) {
  await sql`DROP TRIGGER IF EXISTS event_listener_processed_trigger ON event_listeners`
    .execute(db)
  await sql`DROP FUNCTION IF EXISTS check_event_all_processed_on_event_listener_processed`
    .execute(db)
  await db.schema.dropTable('event_listeners').execute()
  await db.schema.dropTable('events').execute()
}
