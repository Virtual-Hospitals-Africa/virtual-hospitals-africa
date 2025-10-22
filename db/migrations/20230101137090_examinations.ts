import { Kysely, sql } from 'kysely'
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.createTable('examinations')
    .addColumn('identifier', 'varchar(80)', (col) => col.notNull().primaryKey())
    .addColumn('display_name', 'varchar(80)', (col) => col.notNull().unique())
    .addColumn('consultation_step', 'varchar(255)', (col) => col.notNull())
    .addColumn('slug', 'varchar(255)', (col) => col.notNull())
    .addColumn('path', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn(
      'order',
      'integer',
      (col) => col.notNull().unique().check(sql`("order" > 0)`),
    )
    .addUniqueConstraint('exam_step_slug', [
      'consultation_step',
      'slug',
    ])
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('examinations').execute()
}
