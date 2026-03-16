import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.createType('age_determination').asEnum(['adult', 'older child', 'younger child']).execute()
  await db.schema.createType('warning_sign_priority').asEnum(['Urgent', 'Very urgent', 'Emergency']).execute()

  await db.schema
    .createTable('snomed_concept_prioritizations')
    .addColumn('concept_id', 'bigint', (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'))
    .addColumn('age_determination', sql`age_determination`, (col) => col.notNull())
    .addColumn('pregnancy', 'boolean', (col) => col.notNull())
    .addColumn('priority', sql`warning_sign_priority`, (col) => col.notNull())
    .addPrimaryKeyConstraint('snomed_concept_prioritizations_pkey', ['concept_id', 'age_determination', 'pregnancy'])
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('snomed_concept_prioritizations').execute()
  await db.schema.dropType('warning_sign_priority').execute()
  await db.schema.dropType('age_determination').execute()
}
