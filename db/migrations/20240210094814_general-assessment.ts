//deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import parseJSON from '../../util/parseJSON.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('general_assessments')
    .addColumn('assessment', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('category', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('patient_general_assessment')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'general_assessment_id',
      'varchar(255)',
      (col) =>
        col.notNull().references('general_assessments.assessment').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'patient_id',
      'integer',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
    .addUniqueConstraint('patient_general_assessment_unique', [
      'general_assessment_id',
      'patient_id',
    ])
    .execute()

  await addUpdatedAtTrigger(db, 'patient_general_assessment')
  await seedDataFromJSON(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_general_assessment').execute()
  await db.schema.dropTable('general_assessments').execute()
}

async function seedDataFromJSON(db: Kysely<any>) {
  const data: { assessment: string; category: string }[] = await parseJSON(
    './db/resources/general_assessments.json',
  )

  await db
    .insertInto('general_assessments')
    .values(
      data.map((c) => ({ assessment: c.assessment, category: c.category })),
    )
    .executeTakeFirstOrThrow()
}
