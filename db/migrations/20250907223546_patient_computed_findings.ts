import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createPointerTablePartitionedByPatientId, createStandardTablePartitionedByPatientId } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createPointerTablePartitionedByPatientId(
    db,
    'patient_computed_findings',
    {
      references: 'patient_findings',
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

  await createStandardTablePartitionedByPatientId(
    db,
    'patient_computed_findings_inputs',
    (qb) =>
      qb
        .addColumn(
          'computed_finding_id',
          'uuid',
          (col) => col.notNull(),
        )
        .addColumn(
          'input_measurement_id',
          'uuid',
          (col) => col.notNull(),
        ).addForeignKeyConstraint(
          `fk_computed_findings_input_computed_finding_id_patient_id`,
          // deno-lint-ignore no-explicit-any
          ['computed_finding_id', 'patient_id'] as any,
          'patient_computed_findings',
          ['id', 'patient_id'],
          (cb) => cb.onDelete('cascade'),
        )
        .addForeignKeyConstraint(
          `fk_computed_findings_input_input_measurement_id_patient_id`,
          // deno-lint-ignore no-explicit-any
          ['input_measurement_id', 'patient_id'] as any,
          'patient_measurements',
          ['id', 'patient_id'],
          (cb) => cb.onDelete('cascade'),
        ),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_computed_findings_inputs').execute()
  await db.schema.dropTable('patient_computed_findings').execute()
}
