import { Kysely, sql } from 'kysely'

export async function up(
  db: Kysely<{
    examinations: unknown
    diagnostic_tests: unknown
  }>,
) {
  await db.schema.createTable('examinations')
    .addColumn('identifier', 'varchar(80)', (col) => col.notNull().primaryKey())
    .addColumn('display_name', 'varchar(80)', (col) => col.notNull().unique())
    .addColumn('encounter_step', sql`encounter_step`, (col) => col.notNull())
    .addColumn('slug', 'varchar(255)', (col) => col.notNull())
    .addColumn('path', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn(
      'order',
      'integer',
      (col) => col.notNull().unique().check(sql`("order" > 0)`),
    )
    .addUniqueConstraint('exam_step_slug', [
      'encounter_step',
      'slug',
    ])
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('examinations').execute()
}
