import { Kysely, sql } from 'kysely'
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
          'snomed_code',
          'varchar(255)',
          (col) => col.notNull(),
        )
        .addColumn(
          'snomed_english_description',
          'varchar(255)',
          (col) => col.notNull(),
        )
        .addColumn('body_site_snomed_code', 'varchar(255)')
        .addColumn('body_site_snomed_english_description', 'varchar(255)')
        .addColumn('value', 'json', (col) => col.notNull())
        .addCheckConstraint(
          'body_site_presence',
          sql<boolean>`
          (body_site_snomed_code is null) = (body_site_snomed_english_description is null)
        `,
        ),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_examination_findings').execute()
  await db.schema.dropTable('patient_examinations').execute()
}
