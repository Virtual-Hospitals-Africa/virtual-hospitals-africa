import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createPointerTable, createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
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
          'patient_encounter_id',
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
          'patient_encounter_employee_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_encounter_employees.id').onDelete(
              'cascade',
            ),
        ),
  )

  await createPointerTable(db, 'patient_findings', {
    references: 'patient_records',
    primary_key_type: 'uuid',
  }, (qb) =>
    qb.addColumn(
      'patient_encounter_employee_id',
      'uuid',
      (col) =>
        col.notNull().references('patient_encounter_employees.id').onDelete(
          'cascade',
        ),
    )
      .addColumn('procedure_id', 'uuid', (col) =>
        col.notNull().references('patient_procedures.id').onDelete(
          'cascade',
        )))

  await createPointerTable(db, 'patient_measurements', {
    references: 'patient_findings',
    primary_key_type: 'uuid',
  }, (qb) =>
    qb.addColumn('value', 'decimal', (col) => col.notNull())
      .addColumn('units', 'varchar(255)', (col) => col.notNull()))

  await createPointerTable(db, 'patient_chief_complaints', {
    references: 'patient_findings',
    primary_key_type: 'uuid',
  }, (qb) =>
    qb
      .addColumn('language_code', 'varchar(3)', (col) =>
        col.notNull().references('languages.iso_639_2_b'))
      .addColumn('note', 'text', (col) =>
        col.notNull()))

  await createPointerTable(db, 'patient_symptoms', {
    references: 'patient_findings',
    primary_key_type: 'uuid',
  }, (qb) =>
    qb
      .addColumn(
        'severity',
        'int4',
        (col) => col.notNull().check(sql`severity > 0 AND severity <= 10`),
      )
      .addColumn('start_date', 'date', (col) => col.notNull())
      .addColumn('end_date', 'date')
      .addColumn('notes', 'text')
      .addCheckConstraint(
        'symptom_starts_before_today',
        sql`
      start_date <= TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg', 'YYYY-MM-DD')::date
    `,
      )
      .addCheckConstraint(
        'symptom_date_range',
        sql`
        end_date IS NULL OR (
          end_date >= start_date AND
          end_date <= TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg', 'YYYY-MM-DD')::date
        )
      `,
      ))

  await createPointerTable(db, 'patient_finding_media_images', {
    references: 'patient_records',
    primary_key_type: 'uuid',
  }, (qb) =>
    qb.addColumn(
      'finding_id',
      'uuid',
      (col) =>
        col.notNull().references('patient_findings.id').onDelete('cascade'),
    )
      .addColumn(
        'media_image_id',
        'uuid',
        (col) =>
          col.notNull().references('media_images.id').onDelete('cascade'),
      ))

  await createPointerTable(db, 'patient_finding_media_speeches', {
    references: 'patient_findings',
    primary_key_type: 'uuid',
  }, (qb) =>
    qb
      .addColumn(
        'finding_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_findings.id').onDelete('cascade'),
      )
      .addColumn(
        'media_speech_id',
        'uuid',
        (col) =>
          col.notNull().references('media_speeches.id').onDelete('cascade'),
      ))

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
          'employment_id',
          'uuid',
          (col) =>
            col.references('employment.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'by_system',
          'boolean',
          (col) => col.notNull(),
        )
        // more such relations can be declared using patient_record_relations,
        // but evaluations are always made because of at least one other record
        .addColumn(
          'evaluates_record_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_records.id').onDelete('cascade'),
        )
        .addCheckConstraint(
          'evaluation_is_either_by_system_or_by_person',
          sql`(
            by_system or employment_id is not null
          )`,
        ),
  )

  await createPointerTable(
    db,
    'patient_record_relations',
    {
      references: 'patient_records',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb
        .addColumn(
          'source_id',
          'uuid',
          (col) =>
            col.references('patient_records.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'destination_id',
          'uuid',
          (col) =>
            col.references('patient_records.id').onDelete(
              'cascade',
            ),
        ),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_record_relations').execute()
  await db.schema.dropTable('patient_evaluations').execute()
  await db.schema.dropTable('patient_finding_media_speeches').execute()
  await db.schema.dropTable('patient_finding_media_images').execute()
  await db.schema.dropTable('patient_symptoms').execute()
  await db.schema.dropTable('patient_measurements').execute()
  await db.schema.dropTable('patient_chief_complaints').execute()
  await db.schema.dropTable('patient_findings').execute()
  await db.schema.dropTable('patient_procedures').execute()
  await db.schema.dropTable('patient_records').execute()
}
