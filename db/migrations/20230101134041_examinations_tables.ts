import { Kysely, sql } from 'kysely'

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

  await db.schema
    .createTable('examination_categories')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
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
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
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
      'uuid',
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

  // TODO: Add a trigger to ensure the examination findings are of the correct type
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('examination_findings').execute()
  await db.schema.dropTable('examination_categories').execute()
  await db.schema.dropTable('diagnostic_tests').execute()
  await db.schema.dropTable('examinations').execute()
  await db.schema.dropType('examination_finding_type').execute()
}
