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

  await createStandardTable(db, 'prescriptions', (qb) =>
    qb
      .addColumn('prescriber_id', 'uuid', (col) =>
        col.notNull().references('employment.id').onDelete(
          'cascade',
        ))
      .addColumn('patient_id', 'uuid', (col) =>
        col.notNull().references('patients.id').onDelete('cascade'))
      .addColumn('doctor_review_id', 'uuid', (col) =>
        col.references('doctor_reviews.id').onDelete(
          'cascade',
        ))
      .addColumn('patient_encounter_id', 'uuid', (col) =>
        col.references('patient_encounters.id').onDelete(
          'cascade',
        ))
      .addCheckConstraint(
        'either_doctor_review_or_patient_encounter',
        sql<
          boolean
        >`("doctor_review_id" IS NOT NULL) = ("patient_encounter_id" IS NULL)`,
      ))

  await createStandardTable(db, 'prescription_codes', (qb) =>
    qb
      .addColumn(
        'alphanumeric_code',
        'varchar(6)',
        (col) => col.notNull().unique().defaultTo(sql`generate_unique_code()`),
      )
      .addColumn('prescription_id', 'uuid', (col) =>
        col.notNull().references('prescriptions.id').onDelete(
          'cascade',
        )))

  await createStandardTable(
    db,
    'prescription_medications',
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
    'prescription_medications_filled',
    (qb) =>
      qb
        .addColumn('prescription_medication_id', 'uuid', (col) =>
          col
            .notNull()
            .references('prescription_medications.id')
            .onDelete('cascade'))
        .addColumn('pharmacist_id', 'uuid', (col) =>
          col.notNull().references('pharmacists.id').onDelete('cascade'))
        .addColumn('pharmacy_id', 'uuid', (col) =>
          col.references('pharmacies.id').onDelete('cascade'))
        .addUniqueConstraint('prescription_medication_id', [
          'prescription_medication_id',
        ]),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('prescription_medications_filled').execute()
  await db.schema.dropTable('prescription_medications').execute()
  await db.schema.dropTable('prescription_codes').execute()
  await db.schema.dropTable('prescriptions').execute()
}
