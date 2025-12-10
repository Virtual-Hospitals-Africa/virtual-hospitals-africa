import { Kysely } from 'kysely'
import { createPointerTable } from '../createTable.ts'

export async function up(db: Kysely<unknown>) {
  /* not sure this is what we want, but it will introduce a new type of finding that doesn't
  consist in a measurement and will instead be itself a snomed concept id. ie: 'patient is alert'
  */
  await createPointerTable(
    db,
    'patient_categorical_findings',
    {
      references: 'patient_records',
      primary_key_type: 'uuid',
    },
    (qb) => qb,
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_categorical_findings').execute()
}
