import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable('premise_supervisors')
    .addColumn('pharmacist_id', 'uuid', (col) =>
      col.references('pharmacists.id').onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .alterTable('premise_supervisors')
    .dropColumn('pharmacist_id')
    .execute()
}
