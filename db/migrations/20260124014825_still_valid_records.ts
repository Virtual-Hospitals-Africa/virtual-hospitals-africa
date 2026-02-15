import { Kysely } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createPointerTable } from '../createTable.ts'
import { trigger } from '../helpers.ts'

const records_valid_upon_creation = trigger(
  'patient_records',
  'add_to_still_valid',
  `INSERT INTO patient_records_still_valid (id) VALUES (NEW.id);
   RETURN NEW
  `,
  'AFTER',
)

const records_invalid_when_evaluated_so = trigger(
  'patient_evaluations',
  'remove_from_still_valid',
  `DELETE FROM patient_records_still_valid
    WHERE patient_records_still_valid.id = NEW.evaluates_record_id
      AND EXISTS (
        SELECT id 
          FROM patient_records 
         WHERE patient_records.id = NEW.id
           AND patient_records.specific_snomed_concept_id IN (18307000, 723510000)
        )
  ;
   RETURN NEW
  `,
  'AFTER',
)

export async function up(db: Kysely<DB>) {
  await createPointerTable(
    db,
    'patient_records_still_valid',
    {
      references: 'patient_records',
      primary_key_type: 'uuid',
    },
    (qb) => qb,
  )

  await records_valid_upon_creation.up(db)
  await records_invalid_when_evaluated_so.up(db)
}

export async function down(db: Kysely<DB>) {
  await records_invalid_when_evaluated_so.down(db)
  await records_valid_upon_creation.down(db)
  await db.schema.dropTable('patient_records_still_valid').execute()
}
