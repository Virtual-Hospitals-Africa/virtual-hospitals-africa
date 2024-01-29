//deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('patient_conditions')
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
    .addColumn('patient_id', 'integer', (col) =>
      col
        .notNull()
        .references('patients.id')
        .onDelete('cascade'))
    .addColumn('condition_id', 'varchar(255)', (col) =>
      col
        .notNull()
        .references('conditions.id')
        .onDelete('cascade'))
    .addColumn('start_date', 'date', (col) =>
      col
        .notNull())
    .addColumn('end_date', 'date')
    .addColumn('comorbidity_of_condition_id', 'integer', (col) =>
      col
        .references('patient_conditions.id')
        .onDelete('cascade'))
    .addUniqueConstraint('patient_condition_start_date', [
      'patient_id',
      'condition_id',
      'start_date',
    ], (constraint) => constraint.nullsNotDistinct())
    .addCheckConstraint(
      'patient_condition_date_range',
      sql`
        end_date IS NULL OR (
          end_date >= start_date AND
          end_date <= TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg', 'YYYY-MM-DD')::date
        )
    `,
    )
    .execute()
  await addUpdatedAtTrigger(db, 'patient_conditions')
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('patient_conditions').execute()
}
