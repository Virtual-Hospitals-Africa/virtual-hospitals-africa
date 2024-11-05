import { Kysely, sql } from 'kysely'

export async function up(
  db: Kysely<{
    examinations: unknown
    diagnostic_tests: unknown
  }>,
) {
  await db.schema.createTable('examinations')
    .addColumn('name', 'varchar(80)', (col) => col.primaryKey())
    .addColumn('order', 'integer', (col) => col.notNull())
    .addColumn(
      'is_head_to_toe',
      'boolean',
      (col) => col.notNull().defaultTo(false),
    )
    .addColumn('page', 'varchar(255)', (col) => col.notNull())
    .addColumn('tab', 'varchar(255)', (col) => col.notNull())
    .addColumn('path', 'varchar(255)', (col) => col.notNull())
    .addUniqueConstraint('examination_order_unique', ['order'])
    .addCheckConstraint('examination_order_positive', sql`("order" > 0)`)
    .execute()

  await db.schema.createTable('diagnostic_tests')
    .addColumn(
      'name',
      'varchar(48)',
      (col) =>
        col.primaryKey().references('examinations.name').onDelete('cascade'),
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('diagnostic_tests').execute()
  await db.schema.dropTable('examinations').execute()
}
