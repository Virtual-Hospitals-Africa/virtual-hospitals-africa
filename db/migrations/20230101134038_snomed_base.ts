import { Kysely, sql } from 'kysely'

export async function up(
  db: Kysely<unknown>,
) {
  await db.schema.createTable('snomed_concept')
    .addColumn('id', 'bigint', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('definition_status_id', 'bigint', (col) => col.notNull())
    .execute()

  await db.schema.createTable('snomed_description')
    .addColumn('id', 'bigint', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn(
      'concept_id',
      'bigint',
      (col) => col.notNull().references('snomed_concept.id'),
    )
    .addColumn(
      'language_code',
      'varchar(6)',
      (col) => col.notNull().check(sql`language_code = 'en'`),
    )
    .addColumn(
      'term',
      'text',
      (col) => col.notNull(),
    )
    .addColumn(
      'type_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'case_significance_id',
      'bigint',
      (col) => col.notNull(),
    )
    .execute()

  await db.schema.createTable('snomed_relationship')
    .addColumn('id', 'bigint', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn(
      'source_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'destination_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'relationship_group',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'type_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'characteristic_type_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'modifier_id',
      'bigint',
      (col) => col.notNull(),
    )
    .execute()

  await db.schema.createTable('snomed_cci_refset_refset_descriptor')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('attribute_description', 'bigint', (col) => col.notNull())
    .addColumn('attribute_type', 'bigint', (col) => col.notNull())
    .addColumn('attribute_order', 'bigint', (col) => col.notNull())
    .execute()
  await db.schema.createTable('snomed_ci_refset_description_type')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('description_format', 'bigint', (col) => col.notNull())
    .addColumn('description_length', 'bigint', (col) => col.notNull())
    .execute()
  await db.schema.createTable('snomed_cisscc_refset_mrcm_attribute_domain')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('domain_id', 'bigint', (col) => col.notNull())
    .addColumn('grouped', 'boolean', (col) => col.notNull())
    .addColumn('attribute_cardinality', 'varchar(10)', (col) => col.notNull())
    .addColumn(
      'attribute_in_group_cardinality',
      'varchar(10)',
      (col) => col.notNull(),
    )
    .addColumn('rule_strength_id', 'bigint', (col) => col.notNull())
    .addColumn('content_type_id', 'bigint', (col) => col.notNull())
    .execute()
  await db.schema.createTable('snomed_c_refset_association')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('target_component_id', 'bigint', (col) => col.notNull())
    .execute()
  await db.schema.createTable('snomed_c_refset_attribute_value')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('value_id', 'bigint', (col) => col.notNull())
    .execute()
  await db.schema.createTable('snomed_c_refset_language')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('acceptability_id', 'bigint', (col) => col.notNull())
    .execute()
  await db.schema.createTable('snomed_c_refset_mrcm_module_scope')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('mrcm_rule_refset_id', 'bigint', (col) => col.notNull())
    .execute()
  await db.schema.createTable('snomed_iissscc_refset_extended_map')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('map_group', 'bigint', (col) => col.notNull())
    .addColumn('map_priority', 'bigint', (col) => col.notNull())
    .addColumn('map_rule', 'text')
    .addColumn('map_advice', 'text')
    .addColumn('map_target', 'text')
    .addColumn('correlation_id', 'bigint', (col) => col.notNull())
    .addColumn('map_category_id', 'bigint', (col) => col.notNull())
    .execute()
  await db.schema.createTable('snomed_refset_simple')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .execute()
  // await db.schema.createTable(
  //   'snomed_scs_refset_component_annotation_string_value',
  // )
  //   .addColumn('id', 'uuid', (col) => col.primaryKey())
  //   .addColumn('effective_time', 'date', (col) => col.notNull())
  //   .addColumn('active', 'boolean', (col) => col.notNull())
  //   .addColumn('module_id', 'bigint', (col) => col.notNull())
  //   .addColumn('refset_id', 'bigint', (col) => col.notNull())
  //   .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
  //   .addColumn('language_code', 'varchar(10)', (col) => col.notNull())
  //   .addColumn('type_id', 'bigint', (col) => col.notNull())
  //   .addColumn('value', 'text')
  //   .execute()
  await db.schema.createTable('snomed_s_refset_simple_map')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('map_target', 'text', (col) => col.notNull())
    .execute()
  await db.schema.createTable('snomed_sscc_refset_mrcm_attribute_range')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('range_constraint', 'text', (col) => col.notNull())
    .addColumn('attribute_rule', 'text', (col) => col.notNull())
    .addColumn('rule_strength_id', 'bigint', (col) => col.notNull())
    .addColumn('content_type_id', 'bigint', (col) => col.notNull())
    .execute()
  // await db.schema.createTable(
  //   'snomed_sscs_refset_member_annotation_string_value',
  // )
  //   .addColumn('id', 'uuid', (col) => col.primaryKey())
  //   .addColumn('effective_time', 'date', (col) => col.notNull())
  //   .addColumn('active', 'boolean', (col) => col.notNull())
  //   .addColumn('module_id', 'bigint', (col) => col.notNull())
  //   .addColumn('refset_id', 'bigint', (col) => col.notNull())
  //   .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
  //   .addColumn('referenced_member_id', 'uuid', (col) => col.notNull())
  //   .addColumn('language_code', 'varchar(10)', (col) => col.notNull())
  //   .addColumn('type_id', 'bigint', (col) => col.notNull())
  //   .addColumn('value', 'text')
  //   .execute()
  await db.schema.createTable('snomed_ss_refset_module_dependency')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('source_effective_time', 'date', (col) => col.notNull())
    .addColumn('target_effective_time', 'date', (col) => col.notNull())
    .execute()
  await db.schema.createTable('snomed_sssssss_refset_mrcm_domain')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('domain_constraint', 'text', (col) => col.notNull())
    .addColumn('parent_domain', 'text')
    .addColumn('proximal_primitive_constraint', 'text', (col) => col.notNull())
    .addColumn('proximal_primitive_refinement', 'text')
    .addColumn(
      'domain_template_for_precoordination',
      'text',
      (col) => col.notNull(),
    )
    .addColumn(
      'domain_template_for_postcoordination',
      'text',
      (col) => col.notNull(),
    )
    .addColumn('guide_url', 'text')
    .execute()
  // await db.schema.createTable('snomed_identifier')
  //   .addColumn('alternate_identifier', 'text', (col) => col.primaryKey())
  //   .addColumn('effective_time', 'date', (col) => col.notNull())
  //   .addColumn('active', 'boolean', (col) => col.notNull())
  //   .addColumn('module_id', 'bigint', (col) => col.notNull())
  //   .addColumn('identifier_scheme_id', 'bigint', (col) => col.notNull())
  //   .addColumn(
  //     'referenced_component_id',
  //     'bigint',
  //     (col) => col.notNull(),
  //   )
  //   .execute()
  await db.schema.createTable('snomed_relationship_concrete_values')
    .addColumn('id', 'bigint', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn(
      'source_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn('value', 'text', (col) => col.notNull())
    .addColumn(
      'relationship_group',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'type_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'characteristic_type_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'modifier_id',
      'bigint',
      (col) => col.notNull(),
    )
    .execute()
  await db.schema.createTable('snomed_s_refset_owl_expression')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn('refset_id', 'bigint', (col) => col.notNull())
    .addColumn('referenced_component_id', 'bigint', (col) => col.notNull())
    .addColumn('owl_expression', 'text', (col) => col.notNull())
    .execute()
  await db.schema.createTable('snomed_stated_relationship')
    .addColumn('id', 'bigint', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn(
      'source_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'destination_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'relationship_group',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'type_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'characteristic_type_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'modifier_id',
      'bigint',
      (col) => col.notNull(),
    )
    .execute()
  await db.schema.createTable('snomed_text_definition')
    .addColumn('id', 'bigint', (col) => col.primaryKey())
    .addColumn('effective_time', 'date', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.notNull())
    .addColumn('module_id', 'bigint', (col) => col.notNull())
    .addColumn(
      'concept_id',
      'bigint',
      (col) => col.notNull().references('snomed_concept.id'),
    )
    .addColumn(
      'language_code',
      'varchar(6)',
      (col) => col.notNull().check(sql`language_code = 'en'`),
    )
    .addColumn(
      'type_id',
      'bigint',
      (col) => col.notNull(),
    )
    .addColumn(
      'term',
      'text',
      (col) => col.notNull(),
    )
    .addColumn(
      'case_significance_id',
      'bigint',
      (col) => col.notNull(),
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('snomed_text_definitionsnomed_stated_relationship')
  await db.schema.dropTable('snomed_s_refset_owl_expression')
  await db.schema.dropTable('snomed_relationship_concrete_values')
  // await db.schema.dropTable('snomed_identifier')
  await db.schema.dropTable('snomed_sssssss_refset_mrcm_domain')
  await db.schema.dropTable('snomed_ss_refset_module_dependency')
  // await db.schema.dropTable('snomed_sscs_refset_member_annotation_string_value')
  await db.schema.dropTable('snomed_sscc_refset_mrcm_attribute_range')
  await db.schema.dropTable('snomed_s_refset_simple_map')
  // await db.schema.dropTable(
  //   'snomed_scs_refset_component_annotation_string_value',
  // )
  await db.schema.dropTable('snomed_refset_simple')
  await db.schema.dropTable('snomed_iissscc_refset_extended_map')
  await db.schema.dropTable('snomed_c_refset_mrcm_module_scope')
  await db.schema.dropTable('snomed_c_refset_language')
  await db.schema.dropTable('snomed_c_refset_attribute_value')
  await db.schema.dropTable('snomed_c_refset_association')
  await db.schema.dropTable('snomed_cisscc_refset_mrcm_attribute_domain')
  await db.schema.dropTable('snomed_ci_refset_description_type')
  await db.schema.dropTable('snomed_cci_refset_refset_descriptor')
  await db.schema.dropTable('snomed_relationship')
  await db.schema.dropTable('snomed_description')
  await db.schema.dropTable('snomed_concept')
}
