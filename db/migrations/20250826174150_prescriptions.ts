import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createPointerTable, createStandardTable } from '../createTable.ts'
import { PrescriptionFrequencies } from '../../shared/prescription.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createType('medication_frequency')
    .asEnum(Object.keys(PrescriptionFrequencies))
    .execute()

  await db.schema
    .createType('duration_units')
    .asEnum([
      'days',
      'weeks',
      'months',
      'years',
      'indefinitely',
    ])
    .execute()

  await sql`
    CREATE DOMAIN decimal_text AS text CHECK (VALUE ~ '^[0-9]+(\.[0-9]+)?$');

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
            
            -- Check if the generated code already exists in the patient_prescription_redemption_codes table
            SELECT INTO exists
                EXISTS (SELECT 1 FROM patient_prescription_redemption_codes WHERE alphanumeric_code = new_code);
            
            -- If the code does not exist, exit the loop
            IF NOT exists THEN
                EXIT;
            END IF;
        END LOOP;

        RETURN new_code;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db)

  await createPointerTable(db, 'patient_prescription_medications', { references: 'patient_evaluations', primary_key_type: 'uuid' }, (qb) =>
    qb
      .addColumn('medication_id', 'uuid', (col) => col.notNull().references('medications.id').onDelete('cascade'))
      .addColumn('special_instructions', 'text'))

  await createPointerTable(db, 'patient_prescription_medication_schedules', { references: 'patient_evaluations', primary_key_type: 'uuid' }, (qb) =>
    qb
      .addColumn('patient_prescription_medications_id', 'uuid', (col) => col.notNull().references('patient_prescription_medications.id').onDelete('cascade'))
      .addColumn('medication_dose_id', 'uuid', (col) => col.notNull().references('medication_doses.id').onDelete('cascade'))
      .addColumn('route', 'varchar(255)', (col) => col.notNull())
      .addColumn('frequency', sql`medication_frequency`, (col) => col.notNull())
      .addColumn('dosage', sql`decimal_text`)
      .addColumn('duration', 'integer')
      .addColumn('duration_unit', sql`duration_units`)
      .addColumn('order', 'smallint', (col) => col.notNull())
      .addUniqueConstraint('patient_prescription_medication_schedule_order', ['patient_prescription_medications_id', 'medication_dose_id', 'order'])
      .addCheckConstraint(
        'medication_has_defined_dosage_or_as_needed',
        sql`
          (dosage is not null and duration is not null and duration_unit is not null) OR
          (frequency in ('qs', 'stat', 'prn'))
      `,
      ))

  await createPointerTable(db, 'patient_prescription_signatures', { references: 'patient_procedures', primary_key_type: 'uuid' })

  await createStandardTable(db, 'patient_prescription_redemption_codes', (qb) =>
    qb
      .addColumn('patient_prescription_signature_id', 'uuid', (col) =>
        col.notNull().unique().references('patient_prescription_signatures.id').onDelete('cascade'))
      .addColumn(
        'alphanumeric_code',
        'varchar(6)',
        (col) =>
          col.notNull().unique().defaultTo(sql`generate_unique_code()`),
      ))

  await createPointerTable(
    db,
    'patient_prescriptions_filled',
    {
      references: 'patient_procedures',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb
        .addColumn('patient_prescription_medication_id', 'uuid', (col) =>
          col
            .notNull()
            .unique()
            .references('patient_prescription_medications.id')
            .onDelete('cascade')),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_prescriptions_filled').execute()
  await db.schema.dropTable('patient_prescription_redemption_codes').execute()
  await db.schema.dropTable('patient_prescription_signatures').execute()
  await db.schema.dropTable('patient_prescription_medication_schedules').execute()
  await db.schema.dropTable('patient_prescription_medications').execute()

  await sql`DROP DOMAIN IF EXISTS decimal_text`.execute(db)
  await db.schema.dropType('duration_units').execute()
  await db.schema.dropType('medication_frequency').execute()
}
