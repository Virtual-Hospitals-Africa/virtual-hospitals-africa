import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<DB>) {
  await db.schema.createType('snomed_category')
    .asEnum([
      'administration method',
      'assessment scale',
      'attribute',
      'basic dose form',
      'body structure',
      'calculation',
      'cell',
      'cell structure',
      'clinical drug',
      'core metadata concept',
      'disorder',
      'disposition',
      'dose form',
      'environment',
      'environment / location',
      'ethnic group',
      'event',
      'finding',
      'foundation metadata concept',
      'geographic location',
      'intended site',
      'link assertion',
      'linkage concept',
      'medicinal product',
      'medicinal product form',
      'metadata',
      'morphologic abnormality',
      'namespace concept',
      'navigational concept',
      'observable entity',
      'occupation',
      'organism',
      'OWL metadata concept',
      'person',
      'physical force',
      'physical object',
      'procedure',
      'product',
      'product name',
      'qualifier value',
      'racial group',
      'record artifact',
      'regime/therapy',
      'release characteristic',
      'religion/philosophy',
      'role',
      'situation',
      'SNOMED RT+CTV3',
      'social concept',
      'special concept',
      'specimen',
      'staging scale',
      'state of matter',
      'substance',
      'supplier',
      'transformation',
      'tumor staging',
      'unit of presentation',
    ])
    .execute()

  await db.schema.createTable('snomed_inferred_canonical_name_and_category')
    .addColumn(
      'id',
      'bigint',
      (col) => col.primaryKey().references('snomed_concept.id'),
    )
    .addColumn(
      'description_id',
      'bigint',
      (col) => col.notNull().references('snomed_description.id'),
    )
    .addColumn(
      'language_code',
      'varchar(6)',
      (col) => col.notNull().check(sql`language_code = 'en'`),
    )
    .addColumn(
      'name',
      'text',
      (col) => col.notNull(),
    )
    .addColumn(
      'category',
      sql`snomed_category`,
      (col) => col.notNull(),
    )
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('snomed_inferred_canonical_name_and_category')
    .execute()
  await db.schema.dropType('snomed_category').execute()
}
