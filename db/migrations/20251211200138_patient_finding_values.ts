import { Kysely } from 'kysely'
import { DB } from '../../db.d.ts'
import { createPointerTable } from '../createTable.ts'

export function up(db: Kysely<DB>) {
  return createPointerTable(
    db,
    'patient_finding_values',
    {
      references: 'patient_findings',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb
        .addColumn(
          'value_snomed_concept_id',
          'bigint',
          (col) =>
            col.references('snomed_concept.id').onDelete(
              'cascade',
            ),
        ),
  )
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('patient_finding_values').execute()
}
