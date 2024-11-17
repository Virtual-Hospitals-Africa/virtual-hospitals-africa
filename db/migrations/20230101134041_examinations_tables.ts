import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(
  db: Kysely<{
    examinations: unknown
    diagnostic_tests: unknown
  }>,
) {
  await createStandardTable(db, 'examinations', (table) =>
    table
      .addColumn('name', 'varchar(80)', (col) => col.notNull().unique())
      .addColumn('order', 'integer', (col) =>
        col.notNull().unique().check(sql`("order" > 0)`))
      .addColumn('route', 'varchar(255)', (col) =>
        col.notNull()), {
    id_type: 'varchar(60)',
  })

  await db.schema.createTable('examination')

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
