import { Kysely, sql } from 'kysely'
import { createPointerTable, createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'patient_records',
    (qb) =>
      qb.addColumn(
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
          'snomed_concept_id',
          'bigint',
          (col) => col.notNull().references('snomed_concept.id'),
        ),
  )

  await createPointerTable(
    db,
    'patient_procedures',
    {
      references: 'patient_records',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb
        .addColumn(
          'encounter_provider_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_encounter_providers.id').onDelete(
              'cascade',
            ),
        ),
  )

  await createPointerTable(db, 'patient_findings', {
    references: 'patient_records',
    primary_key_type: 'uuid',
  }, (qb) =>
    qb.addColumn(
      'encounter_provider_id',
      'uuid',
      (col) =>
        col.notNull().references('patient_encounter_providers.id').onDelete(
          'cascade',
        ),
    )
      .addColumn('procedure_id', 'uuid', (col) =>
        col.notNull().references('patient_procedures.id').onDelete(
          'cascade',
        ))
      .addColumn('referent_finding_id', 'uuid', (col) =>
        col.references('patient_findings.id').onDelete('cascade')))

  await createPointerTable(db, 'patient_measurements', {
    references: 'patient_findings',
    primary_key_type: 'uuid',
  }, (qb) =>
    qb.addColumn('value', 'decimal', (col) => col.notNull())
      .addColumn('units', 'varchar(255)', (col) => col.notNull()))

  await createPointerTable(
    db,
    'patient_evaluations',
    {
      references: 'patient_records',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb
        .addColumn(
          'encounter_provider_id',
          'uuid',
          (col) =>
            col.references('patient_encounter_providers.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'review_id',
          'uuid',
          (col) =>
            col.references('doctor_reviews.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'evaluates_record_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_records.id').onDelete(
              'cascade',
            ),
        )
        .addColumn('note', 'text')
        .addCheckConstraint(
          'evaluation_is_either_by_encounter_provider_or_during_review',
          sql`
            ((encounter_provider_id is not null) or (review_id is not null))
          `,
        ),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_evaluations').execute()
  await db.schema.dropTable('patient_measurements').execute()
  await db.schema.dropTable('patient_findings').execute()
  await db.schema.dropTable('patient_procedures').execute()
  await db.schema.dropTable('patient_records').execute()
}
