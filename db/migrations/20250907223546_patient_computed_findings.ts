import { Kysely, sql } from 'kysely'
import { createPointerTable, createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<unknown>) {
  await createPointerTable(
    db,
    'patient_computed_findings',
    {
      references: 'patient_findings',
      primary_key_type: 'uuid',
      include_created_at: true,
    },
    (qb) =>
      qb
        .addColumn(
          'computation_algorithm_version',
          'varchar(50)',
          (col) => col.notNull(),
        )
        .addColumn(
          'computation_metadata',
          'jsonb',
          (col) => col.notNull().defaultTo(sql`'{}'::jsonb`),
        )
        .addColumn('value', 'decimal', (col) => col.notNull())
        .addColumn('units', 'varchar(255)', (col) => col.notNull()),
  )

  await createStandardTable(
    db,
    'patient_computed_findings_inputs',
    (qb) =>
      qb
        .addColumn(
          'computed_finding_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_computed_findings.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'input_measurement_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_measurements.id').onDelete(
              'cascade',
            ),
        ),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_computed_findings_inputs').execute()
  await db.schema.dropTable('patient_computed_findings').execute()
}
