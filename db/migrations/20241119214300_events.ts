import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(db, 'events', (qb) =>
    qb
      .addColumn('type', 'varchar(255)', (col) => col.notNull())
      .addColumn('data', 'jsonb', (col) => col.notNull())
      .addColumn('listener_names', sql`varchar(255)[]`, (col) => col.notNull())
      .addColumn('patient_encounter_id', 'uuid', (col) => col.references('patient_encounters.id').onDelete('cascade'))
      .addColumn('error_message', 'text')
      .addColumn('all_processed_at', 'timestamptz'))

  await createStandardTable(db, 'event_listeners', (qb) =>
    qb
      .addColumn('event_id', 'uuid', (col) => col.notNull().references('events.id').onDelete('cascade'))
      .addColumn('listener_name', 'varchar(255)', (col) => col.notNull())
      .addColumn('started_processing_at', 'timestamptz')
      .addColumn('error_message', 'text')
      .addColumn('success_message', 'text')
      .addColumn('processed_at', 'timestamptz')
      .addCheckConstraint('not_both_error_and_success_event_listeners', sql`((error_message is null) or (success_message is null))`)
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
    CREATE OR REPLACE FUNCTION set_event_patient_encounter_id()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.patient_encounter_id := (NEW.data->>'patient_encounter_id')::uuid;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db)

  await sql`
    CREATE TRIGGER event_set_patient_encounter_id_trigger
    BEFORE INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION set_event_patient_encounter_id();
  `.execute(db)

  await sql`
    CREATE OR REPLACE FUNCTION check_all_events_settled_for_patient_encounter()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Only fire when all_processed_at is set (was null, now not null)
      -- and the event belongs to a patient encounter
      IF OLD.all_processed_at IS NULL AND NEW.all_processed_at IS NOT NULL AND NEW.patient_encounter_id IS NOT NULL THEN
        -- Use advisory lock to prevent concurrent notifications for the same encounter
        PERFORM pg_advisory_xact_lock(hashtext(NEW.patient_encounter_id::text));

        IF NOT EXISTS (
          SELECT 1 FROM events
          WHERE events.patient_encounter_id = NEW.patient_encounter_id
            AND events.all_processed_at IS NULL
        ) THEN
          PERFORM pg_notify('all_events_settled_for_patient_encounter', NEW.patient_encounter_id::text);
        END IF;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db)

  await sql`
    CREATE TRIGGER event_all_events_settled_for_patient_encounter_trigger
    AFTER UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION check_all_events_settled_for_patient_encounter();
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
      PERFORM pg_notify('event_inserted', json_build_object('id', NEW.id, 'data', NEW.data)::text);
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

  await db.schema
    .createIndex('idx_event_listeners_event_id')
    .on('event_listeners')
    .column('event_id')
    .execute()

  await db.schema
    .createIndex('idx_event_listeners_listener_name')
    .on('event_listeners')
    .column('listener_name')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await sql`DROP TRIGGER IF EXISTS event_insert_trigger ON events`
    .execute(db)
  await sql`DROP FUNCTION IF EXISTS create_event_listeners_on_event_insert`
    .execute(db)
  await sql`DROP TRIGGER IF EXISTS event_set_patient_encounter_id_trigger ON events`
    .execute(db)
  await sql`DROP FUNCTION IF EXISTS set_event_patient_encounter_id`
    .execute(db)
  await sql`DROP TRIGGER IF EXISTS event_all_events_settled_for_patient_encounter_trigger ON events`
    .execute(db)
  await sql`DROP FUNCTION IF EXISTS check_all_events_settled_for_patient_encounter`
    .execute(db)
  await sql`DROP TRIGGER IF EXISTS event_listener_processed_trigger ON event_listeners`
    .execute(db)
  await sql`DROP FUNCTION IF EXISTS check_event_all_processed_on_event_listener_processed`
    .execute(db)
  await db.schema.dropTable('event_listeners').execute()
  await db.schema.dropTable('events').execute()
}
