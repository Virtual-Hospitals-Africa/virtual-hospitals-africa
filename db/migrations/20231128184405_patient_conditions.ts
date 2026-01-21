//deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export function up(db: Kysely<any>) {
  return createStandardTable(
    db,
    'patient_conditions',
    (qb) =>
      qb.addColumn('patient_id', 'uuid', (col) =>
        col
          .notNull()
          .references('patients.id')
          .onDelete('cascade'))
        .addColumn('condition_id', 'varchar(255)', (col) =>
          col
            .notNull()
            .references('conditions.id')
            .onDelete('cascade'))
        .addColumn('patient_examination_id', 'uuid', (col) =>
          col
            .references('patient_examinations.id')
            .onDelete('cascade'))
        .addColumn('start_date', 'date', (col) =>
          col
            .notNull())
        .addColumn('end_date', 'date')
        .addColumn('comorbidity_of_condition_id', 'uuid', (col) =>
          col
            .references('patient_conditions.id')
            .onDelete('cascade'))
        .addUniqueConstraint('patient_condition_start_date', [
          'patient_id',
          'condition_id',
          'start_date',
        ], (constraint) => constraint.nullsNotDistinct())
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
  ).then(async () => {
    await db.schema
      .createIndex('idx_patient_conditions_condition_id')
      .on('patient_conditions')
      .column('condition_id')
      .execute()

    await db.schema
      .createIndex('idx_patient_conditions_patient_examination_id')
      .on('patient_conditions')
      .column('patient_examination_id')
      .execute()

    await db.schema
      .createIndex('idx_patient_conditions_comorbidity_of_condition_id')
      .on('patient_conditions')
      .column('comorbidity_of_condition_id')
      .execute()

    await db.schema
      .createIndex('idx_patient_conditions_start_date')
      .on('patient_conditions')
      .column('start_date')
      .execute()
  })
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('patient_conditions').execute()
}
