import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<DB>) {
  await db.schema.createTable('warning_signs')
    .addColumn(
      'finding_snomed_concept_id',
      'bigint',
      (col) => col.notNull().references('snomed_concept.id'),
    )
    .addColumn(
      'qualifer_snomed_concept_id',
      'bigint',
      (col) => col.references('snomed_concept.id'),
    )
    .addColumn('sats_primary_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('sats_secondary_text', 'varchar(255)')
    .addColumn(
      'sats_priority_snomed_concept_id',
      'bigint',
      (col) =>
        col.notNull().references('snomed_concept.id').check(sql`(
          sats_priority_snomed_concept_id = 103391001 OR -- Urgent
          sats_priority_snomed_concept_id = 1356878002 OR -- Very urgent
          sats_priority_snomed_concept_id = 25876001 -- Emergency
      )`),
    )
    .addUniqueConstraint('warning_sign_finding_and_qualifier', [
      'finding_snomed_concept_id',
      'qualifer_snomed_concept_id',
    ])
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('warning_signs').execute()
}
