import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(db, 'prescriptions', (qb) =>
    qb
      .addColumn(
        'alphanumeric_code',
        'varchar(255)',
        (col) => col.notNull().unique(),
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
      qb.addColumn(
        'patient_prescription_medication_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_prescription_medications.id')
            .onDelete('cascade'),
      )
        .addColumn(
          'pharmacist_id',
          'uuid',
          (col) =>
            col.notNull().references('pharmacists.id').onDelete('cascade'),
        )
        .addColumn(
          'pharmacy_id',
          'uuid',
          (col) => col.notNull().references('premises.id').onDelete('cascade'),
        )
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
