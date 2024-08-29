import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await sql`
    CREATE OR REPLACE FUNCTION generate_unique_code()
    RETURNS VARCHAR(6) AS $$
    DECLARE
        new_code VARCHAR(6);
        exists BOOLEAN;
    BEGIN
        LOOP
            -- Generate a random 6-digit alphanumeric code
            new_code := (
                SELECT string_agg(substr('0123456789ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', trunc(random() * 62)::int + 1, 1), '')
                FROM generate_series(1, 6)
            );
            
            -- Check if the generated code already exists in the prescriptions table
            SELECT INTO exists
                EXISTS (SELECT 1 FROM prescriptions WHERE alphanumeric_code = new_code);
            
            -- If the code does not exist, exit the loop
            IF NOT exists THEN
                EXIT;
            END IF;
        END LOOP;

        RETURN new_code;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db)

  await createStandardTable(db, 'prescriptions', (qb) =>
    qb
      .addColumn(
        'alphanumeric_code',
        'varchar(6)',
        (col) => col.notNull().unique().defaultTo(sql`generate_unique_code()`),
      )
      .addColumn('prescriber_id', 'uuid', (col) =>
        col.notNull().references('patient_encounter_providers.id').onDelete(
          'cascade',
        ))
      .addColumn('patient_id', 'uuid', (col) =>
        col.references('patients.id').onDelete('cascade')))

  await createStandardTable(
    db,
    'patient_prescription_medications',
    (qb) =>
      qb.addColumn(
        'patient_condition_medication_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_condition_medications.id').onDelete(
            'cascade',
          ),
      )
        .addColumn(
          'prescription_id',
          'uuid',
          (col) =>
            col.notNull().references('prescriptions.id').onDelete('cascade'),
        ),
  )

  await createStandardTable(
    db,
    'patient_prescription_medications_filled',
    (qb) =>
      qb
        .addColumn('patient_prescription_medication_id', 'uuid', (col) =>
          col
            .notNull()
            .references('patient_prescription_medications.id')
            .onDelete('cascade'))
        .addColumn('pharmacist_id', 'uuid', (col) =>
          col.notNull().references('pharmacists.id').onDelete('cascade'))
        .addColumn('pharmacy_id', 'uuid', (col) =>
          col.notNull().references('pharmacists.id').onDelete('cascade'))
        .addUniqueConstraint('patient_prescription_medication_id', [
          'patient_prescription_medication_id',
        ]),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_prescription_medications_filled').execute()
  await db.schema.dropTable('patient_prescription_medications').execute()
  await db.schema.dropTable('prescriptions').execute()
}
