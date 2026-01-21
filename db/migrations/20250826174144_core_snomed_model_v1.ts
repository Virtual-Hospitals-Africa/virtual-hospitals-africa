import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createPointerTablePartitionedByPatientId, createStandardTablePartitionedByPatientId } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  // Create patient_records as a partitioned table
  await createStandardTablePartitionedByPatientId(
    db,
    'patient_records',
    (qb) =>
      qb.addColumn(
        'patient_encounter_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_encounters.id').onDelete(
            'cascade',
          ),
      )
        .addColumn(
          'root_snomed_concept_id',
          'bigint',
          (col) =>
            col.notNull().references('snomed_concept.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'specific_snomed_concept_id',
          'bigint',
          (col) =>
            col.notNull().references('snomed_concept.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'value_snomed_concept_id',
          'bigint',
          (col) =>
            col.references('snomed_concept.id').onDelete(
              'cascade',
            ),
        ),
  )

  await createPointerTablePartitionedByPatientId(
    db,
    'patient_procedures',
    {
      references: 'patient_records',
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
        .addCheckConstraint(
          'procedure_added_either_by_system_or_by_person',
          sql`(
            by_system or employment_id is not null
          )`,
        ),
  )

  await createPointerTablePartitionedByPatientId(db, 'patient_findings', {
    references: 'patient_records',
  }, (qb) =>
    qb
      .addColumn(
        'patient_encounter_employee_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_encounter_employees.id').onDelete(
            'cascade',
          ),
      )
      .addColumn('procedure_id', 'uuid', (col) => col.notNull())
      .addForeignKeyConstraint(
        `fk_finding_procedure_id_patient_id`,
        // deno-lint-ignore no-explicit-any
        ['procedure_id', 'patient_id'] as any,
        'patient_procedures',
        ['id', 'patient_id'],
        (cb) => cb.onDelete('cascade'),
      ))

  await createPointerTablePartitionedByPatientId(db, 'patient_measurements', {
    references: 'patient_findings',
  }, (qb) =>
    qb.addColumn('value', 'decimal', (col) => col.notNull())
      .addColumn('units', 'varchar(255)', (col) => col.notNull()))

  await createPointerTablePartitionedByPatientId(db, 'patient_chief_complaints', {
    references: 'patient_findings',
  }, (qb) =>
    qb
      .addColumn('language_code', 'varchar(3)', (col) => col.notNull().references('languages.iso_639_2_b'))
      .addColumn('note', 'text', (col) => col.notNull()))

  await createPointerTablePartitionedByPatientId(db, 'patient_symptoms', {
    references: 'patient_findings',
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

  await createPointerTablePartitionedByPatientId(db, 'patient_finding_media_images', {
    references: 'patient_records',
  }, (qb) =>
    qb.addColumn(
      'finding_id',
      'uuid',
      (col) => col.notNull(),
    )
      .addColumn(
        'media_image_id',
        'uuid',
        (col) => col.notNull().references('media_images.id').onDelete('cascade'),
      )
      .addForeignKeyConstraint(
        `fk_media_images_finding_id_patient_id`,
        // deno-lint-ignore no-explicit-any
        ['finding_id', 'patient_id'] as any,
        'patient_findings',
        ['id', 'patient_id'],
        (cb) => cb.onDelete('cascade'),
      ))

  await createPointerTablePartitionedByPatientId(db, 'patient_finding_media_speeches', {
    references: 'patient_findings',
  }, (qb) =>
    qb
      .addColumn(
        'finding_id',
        'uuid',
        (col) => col.notNull(),
      )
      .addColumn(
        'media_speech_id',
        'uuid',
        (col) => col.notNull().references('media_speeches.id').onDelete('cascade'),
      )
      .addForeignKeyConstraint(
        `fk_media_speech_id_patient_id`,
        // deno-lint-ignore no-explicit-any
        ['finding_id', 'patient_id'] as any,
        'patient_findings',
        ['id', 'patient_id'],
        (cb) => cb.onDelete('cascade'),
      ))

  await createPointerTablePartitionedByPatientId(
    db,
    'patient_evaluations',
    {
      references: 'patient_records',
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
        .addColumn('procedure_id', 'uuid')
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
          (col) => col.notNull(),
        )
        .addCheckConstraint(
          'evaluation_is_either_by_system_or_by_person',
          sql`(
            by_system or (employment_id is not null and procedure_id is not null)
          )`,
        ).addForeignKeyConstraint(
          `fk_evaluation_procedure_id_patient_id`,
          // deno-lint-ignore no-explicit-any
          ['procedure_id', 'patient_id'] as any,
          'patient_procedures',
          ['id', 'patient_id'],
          (cb) => cb.onDelete('cascade'),
        ).addForeignKeyConstraint(
          `fk_evaluation_evaluates_id_patient_id`,
          // deno-lint-ignore no-explicit-any
          ['evaluates_record_id', 'patient_id'] as any,
          'patient_records',
          ['id', 'patient_id'],
          (cb) => cb.onDelete('cascade'),
        ),
  )

  await createPointerTablePartitionedByPatientId(
    db,
    'patient_record_relations',
    {
      references: 'patient_records',
    },
    (qb) =>
      qb
        .addColumn(
          'source_id',
          'uuid',
          (col) => col.notNull(),
        )
        .addColumn(
          'destination_id',
          'uuid',
          (col) => col.notNull(),
        ).addForeignKeyConstraint(
          `fk_relation_source_id_patient_id`,
          // deno-lint-ignore no-explicit-any
          ['source_id', 'patient_id'] as any,
          'patient_records',
          ['id', 'patient_id'],
          (cb) => cb.onDelete('cascade'),
        ).addForeignKeyConstraint(
          `fk_relation_destination_id_patient_id`,
          // deno-lint-ignore no-explicit-any
          ['destination_id', 'patient_id'] as any,
          'patient_records',
          ['id', 'patient_id'],
          (cb) => cb.onDelete('cascade'),
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
