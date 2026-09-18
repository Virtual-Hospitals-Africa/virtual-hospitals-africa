import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createPointerTable, createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.createTable('rules')
    .addColumn('id', 'varchar(255)', (col) => col.notNull().primaryKey())
    .addColumn('description', 'varchar(255)', (col) => col.notNull())
    .addColumn('age_determinations', sql`age_determination[]`, (col) => col.notNull())
    .addColumn('due_to_s_expression', 'text', (col) => col.notNull())
    .execute()

  await createPointerTable(db, 'tasks', {
    references: 'rules',
    primary_key_type: 'varchar(255)',
  }, (qb) => qb.addColumn('to_be_done_s_expression', 'text', (col) => col.notNull()))

  await db.schema.createType('diagnosis_certainty')
    .asEnum([
      'definite',
      'probable',
      'equivocal',
      'possible',
      'improbable',
    ]).execute()

  await createPointerTable(db, 'system_diagnosis_rules', {
    references: 'rules',
    primary_key_type: 'varchar(255)',
  }, (qb) =>
    qb
      .addColumn('snomed_concept_id', 'bigint', (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'))
      .addColumn('certainty', sql`diagnosis_certainty`, (col) => col.notNull()))

  await createPointerTable(db, 'system_priority_evaluations', {
    references: 'rules',
    primary_key_type: 'varchar(255)',
  }, (qb) => qb.addColumn('priority', sql`warning_sign_priority`, (col) => col.notNull()))

  await createStandardTable(db, 'due_to', (qb) =>
    qb
      .addColumn('s_expression', 'text', (col) => col.notNull().unique())
      .addColumn('history', 'boolean', (col) => col.notNull())
      .addColumn('age_determinations', sql`age_determination[]`, (col) => col.notNull()))

  await createStandardTable(db, 'due_to_qualifiers', (qb) =>
    qb
      .addColumn('due_to_id', 'uuid', (col) => col.notNull().references('due_to.id').onDelete('cascade'))
      .addColumn('root_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade'))
      .addColumn('specific_snomed_concept_id', 'bigint', (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'))
      .addColumn('value_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade')))

  await db.schema.createIndex('due_to_qualifiers_due_to_id_idx')
    .on('due_to_qualifiers')
    .column('due_to_id')
    .execute()

  await db.schema.createIndex('due_to_qualifiers_specific_snomed_concept_id_idx')
    .on('due_to_qualifiers')
    .column('specific_snomed_concept_id')
    .execute()

  await createPointerTable(db, 'due_to_findings', { references: 'due_to', primary_key_type: 'uuid' }, (qb) =>
    qb
      .addColumn('root_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade'))
      .addColumn('specific_snomed_concept_id', 'bigint', (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'))
      .addColumn('value_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade'))
      .addColumn('is_somehow_qualified', 'boolean', (col) => col.notNull()))

  await db.schema.createIndex('due_to_findings_specific_snomed_concept_id_idx')
    .on('due_to_findings')
    .column('specific_snomed_concept_id')
    .execute()

  await createPointerTable(db, 'due_to_finding_sites', { references: 'due_to', primary_key_type: 'uuid' }, (qb) =>
    qb
      .addColumn('value_snomed_concept_id', 'bigint', (col) => col.notNull().references('snomed_concept.id').onDelete('cascade')))

  await db.schema.createIndex('rule_due_to_finding_sites_value_snomed_concept_id_idx')
    .on('due_to_finding_sites')
    .column('value_snomed_concept_id')
    .execute()

  await createPointerTable(db, 'due_to_measurements', { references: 'due_to', primary_key_type: 'uuid' }, (qb) =>
    qb
      .addColumn('root_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade'))
      .addColumn('specific_snomed_concept_id', 'bigint', (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'))
      .addColumn('comparator', sql`comparator`, (col) => col.notNull().check(sql`comparator != '='`))
      .addColumn('value', 'decimal', (col) => col.notNull()))

  await db.schema.createIndex('due_to_measurements_specific_snomed_concept_id_idx')
    .on('due_to_measurements')
    .column('specific_snomed_concept_id')
    .execute()

  await createStandardTable(db, 'rule_due_to', (qb) =>
    qb
      .addColumn('rule_id', 'varchar(255)', (col) => col.notNull().references('rules.id').onDelete('cascade'))
      .addColumn('due_to_id', 'uuid', (col) => col.notNull().references('due_to.id').onDelete('cascade'))
      .addColumn('always_applies_if_present', 'boolean', (col) => col.notNull())
      .addUniqueConstraint('rule_due_to_rule_id_due_to_id_unique', ['rule_id', 'due_to_id']))
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('rule_due_to').execute()
  await db.schema.dropTable('due_to_measurements').execute()
  await db.schema.dropTable('due_to_findings').execute()
  await db.schema.dropTable('due_to_finding_sites').execute()
  await db.schema.dropTable('due_to_qualifiers').execute()
  await db.schema.dropTable('due_to').execute()
  await db.schema.dropTable('system_priority_evaluations').execute()
  await db.schema.dropTable('system_diagnosis_rules').execute()
  await db.schema.dropType('diagnosis_certainty').execute()
  await db.schema.dropTable('tasks').execute()
  await db.schema.dropTable('rules').execute()
}
