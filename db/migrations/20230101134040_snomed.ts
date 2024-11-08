import { Kysely } from 'kysely'

export async function up(
  db: Kysely<unknown>,
) {
  // There's so much more than just this, but we rely on Snowstorm for all the heavy lifting
  await db.schema.createTable('snomed_concepts')
    .addColumn('snomed_concept_id', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('english_term', 'varchar(255)', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('snomed_concepts').execute()
}
