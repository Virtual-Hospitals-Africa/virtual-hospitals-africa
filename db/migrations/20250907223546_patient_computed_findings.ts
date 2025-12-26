import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createPointerTable, createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
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
        .addColumn('value', 'decimal')
        .addColumn('units', 'varchar(255)')
        .addColumn('full_display', 'varchar(255)')
        .addCheckConstraint(
          'valid_value_format',
          sql`(full_display IS NOT NULL AND value IS NULL AND units IS NULL) OR (full_display IS NULL AND value IS NOT NULL AND units IS NOT NULL)`,
        ),
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

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_computed_findings_inputs').execute()
  await db.schema.dropTable('patient_computed_findings').execute()
}
