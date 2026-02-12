import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createPointerTable, createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await sql`
    CREATE DOMAIN decimal_text AS text CHECK (VALUE ~ '^[0-9]+(\.[0-9]+)?$');

    CREATE TYPE medication_schedule AS (
      dosage_multiplier decimal_text,
      frequency medication_frequency,
      duration integer,
      duration_unit duration_units
    );

    CREATE OR REPLACE FUNCTION generate_unique_code()
    RETURNS VARCHAR(6) AS $$
    DECLARE
        new_code VARCHAR(6);
        exists BOOLEAN;
    BEGIN
        LOOP
            -- Generate a random 6-digit alphanumeric code
            new_code := (
                SELECT string_agg(substr('0123456789ABCDEFGHJKLMNPQRSTUVWXYZ', trunc(random() * 34)::int + 1, 1), '')
                FROM generate_series(1, 6)
            );
            
            -- Check if the generated code already exists in the prescription_codes table
            SELECT INTO exists
                EXISTS (SELECT 1 FROM prescription_codes WHERE alphanumeric_code = new_code);
            
            -- If the code does not exist, exit the loop
            IF NOT exists THEN
                EXIT;
            END IF;
        END LOOP;

        RETURN new_code;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db)

  await createPointerTable(db, 'patient_prescriptions', { references: 'patient_procedures', primary_key_type: 'uuid' }, qb => 
    qb
      .addColumn('medication_id', 'uuid', col => col.notNull().references('medications.id').onDelete('cascade'))
      .addColumn('schedules', sql`medication_schedule[]`)
      .addColumn('route', 'varchar(255)', (col) => col.notNull())
      .addColumn('special_instructions', 'text')
  )

  await createStandardTable(db, 'patient_prescription_codes', (qb) =>
    qb
      .addColumn(
        'alphanumeric_code',
        'varchar(6)',
        (col) => col.notNull().unique().defaultTo(sql`generate_unique_code()`),
      )
  )

  await createStandardTable(
    db,
    'prescription_medications_filled',
    (qb) =>
      qb
        .addColumn('prescription_medication_id', 'uuid', (col) =>
          col
            .notNull()
            .references('prescription_medications.id')
            .onDelete('cascade'))
        .addColumn('pharmacist_id', 'uuid', (col) => col.notNull().references('pharmacists.id').onDelete('cascade'))
        .addColumn('pharmacy_id', 'uuid', (col) => col.references('pharmacies.id').onDelete('cascade'))
        .addUniqueConstraint('prescription_medication_id', [
          'prescription_medication_id',
        ]),
  )
}

export async function down(db: Kysely<DB>) {
    await db.schema.dropTable('patient_condition_medications').execute()
  await db.schema.dropType('medication_schedule').execute()
  await sql`DROP DOMAIN IF EXISTS decimal_text`.execute(db)
  await db.schema.dropType('duration_units').execute()
  await db.schema.dropType('medication_frequency').execute()

  await db.schema.dropTable('prescription_medications_filled').execute()
  await db.schema.dropTable('prescription_medications').execute()
  await db.schema.dropTable('prescription_codes').execute()
  await db.schema.dropTable('prescriptions').execute()
}
