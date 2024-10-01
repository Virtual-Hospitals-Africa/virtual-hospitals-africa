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
        (col) => col.notNull().references('Patient.id').onDelete('cascade'),
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
          'varchar(40)',
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
          'examination_finding_id',
          'uuid',
          (col) =>
            col.notNull().references('examination_findings.id').onDelete(
              'cascade',
            ),
        )
        .addColumn('value', 'json', (col) => col.notNull())
        .addUniqueConstraint('patient_examination_findings_unique', [
          'patient_examination_id',
          'examination_finding_id',
        ]),
  )

  // TODO: Add a trigger to ensure the examination findings are of the correct type
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_examination_findings').execute()
  await db.schema.dropTable('patient_examinations').execute()
}
