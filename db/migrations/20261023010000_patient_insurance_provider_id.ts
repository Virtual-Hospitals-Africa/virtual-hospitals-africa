import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable('patient_insurance')
    .addColumn('insurance_provider_id', 'uuid', (col) =>
      col.references('insurance_network.id').onDelete('set null'))
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .alterTable('patient_insurance')
    .dropColumn('insurance_provider_id')
    .execute()
}
