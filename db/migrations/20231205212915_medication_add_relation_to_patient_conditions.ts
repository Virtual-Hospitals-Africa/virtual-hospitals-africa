import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  db.schema
    .alterTable('patient_condition_medications')
    .dropColumn('condition_key_id')
    .execute()

  await db.schema
    .alterTable('patient_condition_medications')
    .addColumn('condition_id', 'integer', (col) =>
      col.references('patient_conditions.id').onDelete('cascade')
    )
    .execute()
}

export function down(db: Kysely<unknown>) {
  db.schema
    .alterTable('patient_condition_medications')
    .addColumn('condition_key_id', 'varchar(255)', (col) =>
      col.references('conditions.key_id').onDelete('cascade')
    )

  db.schema
    .alterTable('patient_condition_medications')
    .dropColumn('condition_id')
    .execute()
}
