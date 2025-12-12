import { Kysely, sql } from 'kysely'
import { createPointerTable } from '../createTable.ts'
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await createPointerTable(
    db,
    'patient_record_qualifiers',
    {
      references: 'patient_records',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb.addColumn(
        'qualifies_record_id',
        'uuid',
        (col) => col.references('patient_records.id').notNull(),
      )
        .addColumn(
          'concrete_value',
          'json',
        )
        .addColumn(
          'snomed_concept_id_value',
          'bigint',
          (col) => col.references('snomed_concept.id'),
        )
        .addCheckConstraint(
          'patient_record_qualifier_values_either_snomed_concept_or_concrete',
          sql`(
            (concrete_value IS NULL) OR
            (snomed_concept_id_value IS NULL)
          )`,
        ),
  )
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('patient_record_qualifiers').execute()
}
