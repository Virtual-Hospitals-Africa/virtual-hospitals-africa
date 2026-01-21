import { Kysely } from 'kysely'
import { createPointerTablePartitionedByPatientId } from '../createTable.ts'
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await createPointerTablePartitionedByPatientId(
    db,
    'patient_record_qualifiers',
    {
      references: 'patient_records',
    },
    (qb) =>
      qb.addColumn(
        'qualifies_record_id',
        'uuid',
        (col) => col.notNull(),
      )
        .addForeignKeyConstraint(
          `fk_patient_record_qualifiers_qualifies_record_id_patient_id`,
          // deno-lint-ignore no-explicit-any
          ['qualifies_record_id', 'patient_id'] as any,
          'patient_records',
          ['id', 'patient_id'],
          (cb) => cb.onDelete('cascade'),
        ),
  )
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('patient_record_qualifiers').execute()
}
