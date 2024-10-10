import { Kysely } from "kysely"
import { DB } from "../../db.d.ts"

export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('snomed_concepts')
    .addColumn('id', 'varchar(10)', col => col.primaryKey())
    .addColumn('effective_date', 'date', col => col.notNull())
    .addColumn('active', 'boolean', col => col.notNull())
    .addColumn('module_id', 'varchar(255)', col => col.notNull())
    .addColumn('definition_status_id', 'varchar(255)', col => col.notNull())
  
  await db.schema.createTable('snomed_descriptions')
    .addColumn('id', 'varchar(10)', col => col.primaryKey())
    .addColumn('effective_date', 'date')
    .addColumn('active', 'boolean', col => col.notNull())
    .addColumn('module_id', 'varchar(255)', col => col.notNull())
    .addColumn('concept_id', 'varchar(255)', col => col.references('snomed_concepts.id').onDelete('cascade').notNull())
    .addColumn('language_code', 'varchar(5)', col => col.notNull())
    .addColumn('type_id', 'varchar(255)', col => col.notNull())
    .addColumn('term', 'varchar(255)', col => col.notNull())
    .addColumn('case_significance_id', 'varchar(255)', col => col.notNull())

  await db.schema.createTable('snomed_relationships')
    .addColumn('id', 'varchar(10)', col => col.notNull())
    .addColumn('effective_date', 'date', col => col.notNull())
    .addColumn('active', 'boolean', col => col.notNull())
    .addColumn('module_id', 'varchar(255)', col => col.references('snomed_concepts.id').onDelete('cascade').notNull())
    .addColumn('source_id', 'varchar(10)', col => col.references('snomed_concepts.id').onDelete('cascade').notNull())
    .addColumn('destination_id', 'varchar(10)', col => col.notNull())
    .addColumn('relationship_group', 'varchar(255)', col => col.notNull())
    .addColumn('type_id', 'varchar(255)', col => col.notNull())
    .addColumn('characteristic_type_id', 'varchar(255)', col => col.notNull())
    .addColumn('modifier_id', 'varchar(255)', col => col.notNull())
  
  await db.schema.createTable('snomed_text_definitions')
    .addColumn('id', 'varchar(10)', col => col.notNull())
    .addColumn('effective_date', 'date', col => col.notNull())
    .addColumn('active', 'boolean', col => col.notNull())
    .addColumn('module_id', 'varchar(255)', col => col.notNull())
    .addColumn('concept_id', 'varchar(10)', col => col.references('snomed_concepts.id').onDelete('cascade').notNull())
    .addColumn('language_code', 'varchar(5)', col => col.notNull())
    .addColumn('type_id', 'varchar(255)', col => col.notNull())
    .addColumn('term', 'text', col => col.notNull())
    .addColumn('case_significance_id', 'varchar(255)', col => col.notNull())

  await db.schema.createTable('snomed_relationship_concrete_values')
    .addColumn('id', 'varchar(10)', col => col.notNull())
    .addColumn('effective_date', 'date', col => col.notNull())
    .addColumn('active', 'boolean', col => col.notNull())
    .addColumn('module_id', 'varchar(255)', col => col.notNull())
    .addColumn('source_id', 'varchar(10)', col => col.references('snomed_concepts.id').onDelete('cascade').notNull())
    .addColumn('value', 'decimal', col => col.notNull())
    .addColumn('relationship_group', 'varchar(255)', col => col.notNull())
    .addColumn('type_id', 'varchar(255)', col => col.notNull())
    .addColumn('characteristic_type_id', 'varchar(255)', col => col.notNull())
    .addColumn('modifier_id', 'varchar(255)', col => col.notNull())
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('snomed_text_definitions').execute()
  await db.schema.dropTable('snomed_relationships').execute()
  await db.schema.dropTable('snomed_descriptions').execute()
  await db.schema.dropTable('snomed_concepts').execute()
}
