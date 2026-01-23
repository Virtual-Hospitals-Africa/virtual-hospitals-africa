import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'
import { DB } from '../../db.d.ts'

export async function up(
  db: Kysely<DB>,
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
          'patient_encounter_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_encounters.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'patient_encounter_employee_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_encounter_employees.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'examination_identifier',
          'varchar(80)',
          (col) =>
            col.notNull().references('examinations.identifier').onDelete(
              'cascade',
            ),
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
          'patient_encounter_id',
          'examination_identifier',
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
          'bigint',
          (col) => col.notNull().references('snomed_concept.id'),
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
          'bigint',
          (col) => col.notNull().references('snomed_concept.id'),
        ),
  )

  await db.schema
    .createIndex('idx_patient_examinations_patient_id')
    .on('patient_examinations')
    .column('patient_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_examinations_patient_encounter_employee_id')
    .on('patient_examinations')
    .column('patient_encounter_employee_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_examinations_examination_identifier')
    .on('patient_examinations')
    .column('examination_identifier')
    .execute()

  await db.schema
    .createIndex('idx_patient_examination_findings_patient_examination_id')
    .on('patient_examination_findings')
    .column('patient_examination_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_examination_findings_snomed_concept_id')
    .on('patient_examination_findings')
    .column('snomed_concept_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_examination_finding_body_sites_patient_examination_finding_id')
    .on('patient_examination_finding_body_sites')
    .column('patient_examination_finding_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_examination_finding_body_sites_snomed_concept_id')
    .on('patient_examination_finding_body_sites')
    .column('snomed_concept_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_examination_finding_body_sites').execute()
  await db.schema.dropTable('patient_examination_findings').execute()
  await db.schema.dropTable('patient_examinations').execute()
}
