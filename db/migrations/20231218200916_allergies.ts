import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(db, 'patient_allergies', (qb) =>
    qb.addColumn(
      'snomed_concept_id',
      'varchar(255)',
      (col) =>
        col.notNull().references('snomed_concepts.snomed_concept_id').onDelete(
          'cascade',
        ),
    )
      .addColumn(
        'patient_id',
        'uuid',
        (col) => col.notNull().references('patients.id').onDelete('cascade'),
      )
      .addUniqueConstraint('patient_allergy', [
        'snomed_concept_id',
        'patient_id',
      ]))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_allergies').execute()
}
