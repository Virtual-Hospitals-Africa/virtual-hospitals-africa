import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'patient_procedures',
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
          'encounter_provider_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_encounter_providers.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'snomed_concept_id',
          'bigint',
          (col) => col.notNull().references('snomed_concept.id'),
        ),
  )

  await createStandardTable(db, 'patient_findings', (qb) =>
    qb.addColumn(
      'patient_id',
      'uuid',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
      .addColumn(
        'encounter_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_encounters.id').onDelete('cascade'),
      )
      .addColumn(
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
      .addColumn(
        'snomed_concept_id',
        'bigint',
        (col) =>
          col.notNull().references('snomed_concept.id'),
      )
      .addColumn('referent_finding_id', 'uuid', (col) =>
        col.references('patient_findings.id').onDelete('cascade'))
      .addColumn('finding_type', 'varchar(255)', (col) =>
        col.notNull().check(
          sql`(finding_type = 'measurement' OR finding_type = 'observation')`,
        ))
      .addColumn('value', 'decimal')
      .addColumn('units', 'varchar(255)')
      .addCheckConstraint(
        'measurements_have_values_and_units',
        sql`
          ((finding_type != 'measurement') OR (value IS NOT NULL AND units IS NOT NULL))
        `,
      ))

  await createStandardTable(
    db,
    'patient_evaluations',
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
          'finding_id',
          'uuid',
          (col) =>
            col.references('patient_findings.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'procedure_id',
          'uuid',
          (col) =>
            col.references('patient_procedures.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'evaluation_id',
          'uuid',
          (col) =>
            col.references('patient_evaluations.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'snomed_concept_id',
          'bigint',
          (col) => col.notNull().references('snomed_concept.id'),
        )
        .addColumn('note', 'text')
        .addCheckConstraint(
          'evaluation_is_either_by_encounter_provider_or_during_review',
          sql`
            ((encounter_provider_id is not null) or (review_id is not null))
          `,
        ).addCheckConstraint(
          'evaluating_one_thing',
          sql`
            (((finding_id is not null)::int + (procedure_id is not null)::int + (evaluation_id is not null)::int) = 1)
          `,
        ),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_evaluations').execute()
  await db.schema.dropTable('patient_findings').execute()
  await db.schema.dropTable('patient_procedures').execute()
}
