import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(db, 'events', (qb) =>
    qb
      .addColumn('type', 'varchar(255)', (col) => col.notNull())
      .addColumn('data', 'jsonb', (col) => col.notNull())
      .addColumn('listener_names', sql`varchar(255)[]`, (col) => col.notNull())
      .addColumn('error_message', 'text')
      .addColumn('all_processed_at', 'timestamptz'))

  await createStandardTable(db, 'event_listeners', (qb) =>
    qb
      .addColumn('event_id', 'uuid', (col) => col.notNull().references('events.id').onDelete('cascade'))
      .addColumn('listener_name', 'varchar(255)', (col) => col.notNull())
      .addColumn('started_processing_at', 'timestamptz')
      .addColumn('error_message', 'text')
      .addColumn('processed_at', 'timestamptz')
      .addUniqueConstraint('single_listener', ['event_id', 'listener_name']))

  await sql`
      CREATE OR REPLACE FUNCTION check_event_all_processed_on_event_listener_processed()
      RETURNS TRIGGER AS $$
      DECLARE
        unprocessed_count integer;
      BEGIN
        -- Only fire when processed_at is set (was null, now not null)
        IF OLD.processed_at IS NULL AND NEW.processed_at IS NOT NULL THEN
          -- Use advisory lock to prevent deadlock when multiple listeners
          -- for the same event are processed concurrently
          PERFORM pg_advisory_xact_lock(hashtext(NEW.event_id::text));

          SELECT COUNT(*) INTO unprocessed_count
            FROM event_listeners
           WHERE event_listeners.processed_at IS NULL
             AND event_listeners.event_id = NEW.event_id;

          IF unprocessed_count = 0 THEN
            UPDATE events
              SET all_processed_at = now()
            WHERE events.id = NEW.event_id
              AND events.all_processed_at IS NULL;

            PERFORM pg_notify('event_all_processed', NEW.event_id::text);
          END IF;
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

  await sql`
    CREATE OR REPLACE FUNCTION create_event_listeners_on_event_insert()
    RETURNS TRIGGER AS $$
    DECLARE
      listener_name varchar(255);
      new_event_listener_id uuid;
    BEGIN
      FOREACH listener_name IN ARRAY NEW.listener_names
      LOOP
        new_event_listener_id := gen_random_uuid();
        INSERT INTO event_listeners (id, event_id, listener_name, created_at, updated_at)
        VALUES (new_event_listener_id, NEW.id, listener_name, now(), now());

        PERFORM pg_notify('event_listener_to_be_processed', new_event_listener_id::text);
      END LOOP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db)

  await sql`
    CREATE TRIGGER event_insert_trigger
    AFTER INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION create_event_listeners_on_event_insert();
  `.execute(db)
}

export async function down(db: Kysely<DB>) {
  await sql`DROP TRIGGER IF EXISTS event_insert_trigger ON events`
    .execute(db)
  await sql`DROP FUNCTION IF EXISTS create_event_listeners_on_event_insert`
    .execute(db)
  await sql`DROP TRIGGER IF EXISTS event_listener_processed_trigger ON event_listeners`
    .execute(db)
  await sql`DROP FUNCTION IF EXISTS check_event_all_processed_on_event_listener_processed`
    .execute(db)
  await db.schema.dropTable('event_listeners').execute()
  await db.schema.dropTable('events').execute()
}
