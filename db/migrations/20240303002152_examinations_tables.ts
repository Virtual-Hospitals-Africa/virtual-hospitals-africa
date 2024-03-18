import { Kysely, sql } from 'kysely'
import { DIAGNOSTIC_TESTS, EXAMINATIONS } from '../../shared/examinations.ts'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(
  db: Kysely<{
    examinations: unknown
    diagnostic_tests: unknown
  }>,
) {
  await db.schema.createTable('examinations')
    .addColumn('name', 'varchar(40)', (col) => col.primaryKey())
    .addColumn('order', 'integer', (col) => col.notNull())
    .addUniqueConstraint('examination_order_unique', ['order'])
    .addCheckConstraint('examination_order_positive', sql`("order" > 0)`)
    .execute()

  await db.schema.createTable('diagnostic_tests')
    .addColumn(
      'name',
      'varchar(40)',
      (col) =>
        col.primaryKey().references('examinations.name').onDelete('cascade'),
    )
    .execute()

  await db.insertInto('examinations').values(
    EXAMINATIONS.map((name, index) => ({ name, order: index + 1 })),
  ).execute()

  await db.insertInto('diagnostic_tests').values(
    DIAGNOSTIC_TESTS.map((name) => ({ name })),
  ).execute()

  await db.schema
    .createTable('examination_categories')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'examination_name',
      'varchar(40)',
      (col) =>
        col.notNull().references('examinations.name').onDelete('cascade'),
    )
    .addColumn('category', 'varchar(255)', (col) => col.notNull())
    .addColumn('order', 'integer', (col) => col.notNull())
    .addUniqueConstraint('examination_category_unique', [
      'examination_name',
      'category',
    ])
    .addUniqueConstraint('examination_category_order_unique', [
      'examination_name',
      'order',
    ])
    .addCheckConstraint(
      'examination_category_order_positive',
      sql<boolean>`("order" > 0)`,
    )
    .execute()

  await db.schema
    .createType('examination_finding_type')
    .asEnum([
      'boolean',
      'integer',
      'float',
      'string',
      'date',
      'select',
      'multiselect',
    ])
    .execute()

  await db.schema
    .createTable('examination_findings')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'examination_category_id',
      'integer',
      (col) =>
        col.notNull().references('examination_categories.id').onDelete(
          'cascade',
        ),
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('label', 'varchar(255)', (col) => col.notNull())
    .addColumn('type', sql`examination_finding_type`, (col) => col.notNull())
    .addColumn('required', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('order', 'integer', (col) => col.notNull())
    .addColumn('options', sql`varchar(255)[]`)
    .addColumn(
      'ask_dependent_on',
      'integer',
      (col) => col.references('examination_findings.id').onDelete('cascade'),
    )
    .addColumn('ask_dependent_values', 'json')
    .addUniqueConstraint('examination_finding_unique', [
      'examination_category_id',
      'name',
    ])
    .addUniqueConstraint('examination_finding_order_unique', [
      'examination_category_id',
      'order',
    ])
    .addCheckConstraint(
      'examination_finding_order_positive',
      sql<boolean>`("order" > 0)`,
    )
    .addCheckConstraint(
      'examination_finding_type_options',
      sql<boolean>`
      (type != 'select' AND type != 'multiselect') OR (options IS NOT NULL)
    `,
    )
    .execute()

  await createStandardTable(
    db,
    'patient_examinations',
    (table) =>
      table.addColumn(
        'patient_id',
        'integer',
        (col) => col.notNull().references('patients.id').onDelete('cascade'),
      )
        .addColumn(
          'encounter_id',
          'integer',
          (col) =>
            col.notNull().references('patient_encounters.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'encounter_provider_id',
          'integer',
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
        'integer',
        (col) =>
          col.notNull().references('patient_examinations.id').onDelete(
            'cascade',
          ),
      )
        .addColumn(
          'examination_finding_id',
          'integer',
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
  await db.schema.dropTable('examination_findings').execute()
  await db.schema.dropTable('examination_categories').execute()
  await db.schema.dropTable('diagnostic_tests').execute()
  await db.schema.dropTable('examinations').execute()
  await db.schema.dropType('examination_finding_type').execute()
}
