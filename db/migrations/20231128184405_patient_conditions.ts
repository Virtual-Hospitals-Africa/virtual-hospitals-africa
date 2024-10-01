//deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<any>) {
  return createStandardTable(
    db,
    'patient_conditions',
    (qb) =>
      qb.addColumn('patient_id', 'uuid', (col) =>
        col
          .notNull()
          .references('Patient.id')
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
        .addColumn('comorbidity_of_condition_id', 'uuid', (col) =>
          col
            .references('patient_conditions.id')
            .onDelete('cascade'))
        .addColumn('noted_during_patient_intake_by', 'uuid', (col) =>
          col.references('employment.id').onDelete('cascade'))
        .addUniqueConstraint('patient_condition_start_date', [
          'patient_id',
          'condition_id',
          'start_date',
        ], (constraint) =>
          constraint.nullsNotDistinct())
        .addCheckConstraint(
          'condition_starts_before_today',
          sql`
      start_date <= TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg', 'YYYY-MM-DD')::date
    `,
        )
        .addCheckConstraint(
          'patient_condition_date_range',
          sql`
        end_date IS NULL OR (
          end_date >= start_date AND
          end_date <= TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg', 'YYYY-MM-DD')::date
        )
    `,
        ),
  )
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('patient_conditions').execute()
}
