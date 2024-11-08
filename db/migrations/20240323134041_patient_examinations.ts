import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(
  db: Kysely<{
    examinations: unknown
    diagnostic_tests: unknown
  }>,
) {
  await createStandardTable(
    db,
    'patient_examinations',
    (table) =>
      table.addColumn(
        'patient_id',
        'uuid',
        (col) => col.notNull().references('patients.id').onDelete('cascade'),
      )
        .addColumn(
          'encounter_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_encounters.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'encounter_provider_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_encounter_providers.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'examination_name',
          'varchar(80)',
          (col) =>
            col.notNull().references('examinations.name').onDelete('cascade'),
        )
        .addColumn(
          'completed',
          'boolean',
          (col) => col.notNull().defaultTo(false),
        )
        .addColumn(
          'skipped',
          'boolean',
          (col) => col.notNull().defaultTo(false),
        )
        .addColumn(
          'ordered',
          'boolean',
          (col) => col.notNull().defaultTo(false),
        )
        .addUniqueConstraint('patient_examination_unique', [
          'encounter_id',
          'examination_name',
        ]),
  )

  await createStandardTable(
    db,
    'patient_examination_findings',
    (qb) =>
      qb.addColumn(
        'patient_examination_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_examinations.id').onDelete(
            'cascade',
          ),
      )
        .addColumn(
          'snomed_concept_id',
          'varchar(255)',
          (col) =>
            col.notNull().references('snomed_concepts.snomed_concept_id'),
        )
        .addColumn(
          'additional_notes',
          'text',
        ),
  )

  await createStandardTable(
    db,
    'patient_examination_finding_body_sites',
    (qb) =>
      qb.addColumn(
        'patient_examination_finding_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_examination_findings.id').onDelete(
            'cascade',
          ),
      )
        .addColumn(
          'snomed_concept_id',
          'varchar(255)',
          (col) =>
            col.notNull().references('snomed_concepts.snomed_concept_id'),
        ),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_examination_finding_body_sites').execute()
  await db.schema.dropTable('patient_examination_findings').execute()
  await db.schema.dropTable('patient_examinations').execute()
}
