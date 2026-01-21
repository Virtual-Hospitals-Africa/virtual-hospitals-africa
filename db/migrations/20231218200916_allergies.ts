import { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(db, 'patient_allergies', (qb) =>
    qb.addColumn(
      'snomed_concept_id',
      'bigint',
      (col) =>
        col.notNull().references('snomed_concept.id').onDelete(
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

  await db.schema
    .createIndex('idx_patient_allergies_patient_id')
    .on('patient_allergies')
    .column('patient_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_allergies').execute()
}
