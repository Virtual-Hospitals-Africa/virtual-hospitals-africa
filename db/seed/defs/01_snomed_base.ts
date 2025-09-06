import { assert } from 'std/assert/assert.ts'
import { DB } from '../../../db.d.ts'
import {
  directoryExists,
  rmrf,
  runCommandAssertExitCodeZero,
} from '../../../util/command.ts'
import { chunkTsvResource } from '../../parseTsvResource.ts'
import { create } from '../create.ts'
import z from 'zod'
import { spinner } from '../../../util/spinner.ts'

const latest_snomed = 'SnomedCT_InternationalRF2_PRODUCTION_20250801T120000Z'
const snomed_file_suffix = '_INT_20250801.txt'

async function ensureLatestSnomedExtractedAndFilesLayFlatInDirectory() {
  const already_extracted = await directoryExists(
    './db/resources/extracted/snomed',
  )
  if (already_extracted) return

  await runCommandAssertExitCodeZero('mkdir', {
    args: ['-p', './db/resources/extracted'],
  })

  await runCommandAssertExitCodeZero('unzip', {
    args: [
      `./db/resources/${latest_snomed}.zip`,
      '-d',
      './db/resources/extracted/snomed',
    ],
  })

  await rmrf('./db/resources/extracted/snomed/__MACOSX')
  await rmrf(
    `./db/resources/extracted/snomed/${latest_snomed}/Full`,
  )
  await rmrf(
    `./db/resources/extracted/snomed/${latest_snomed}/Readme_en_20240301.txt`,
  )

  await runCommandAssertExitCodeZero(
    'find ./db/resources/extracted/snomed -mindepth 2 -type f -exec mv {} ./db/resources/extracted/snomed \;',
    {
      verbose: true,
    },
  )
  await rmrf(
    `./db/resources/extracted/snomed/${latest_snomed}`,
  )
}

const active = z.number().int().transform((active) => {
  assert(active === 0 || active === 1)
  return active === 1
})

const effective_time = z.number().transform((s) => {
  const str = String(s)
  return str.slice(0, 4) + '-' + str.slice(4, 6) + '-' + str.slice(6, 8)
})

const number_or_string_as_string = z.string().or(z.number()).transform((s) =>
  String(s)
)

const snomed_tables: {
  table: keyof DB
  text_file: string
  schema: z.ZodObject<z.ZodRawShape>
}[] = [
  {
    table: 'snomed_concept',
    text_file: `sct2_Concept_Snapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.number().int(),
      effective_time,
      active,
      module_id: z.number().int(),
      definition_status_id: z.number().int(),
    }),
  },
  {
    table: 'snomed_description',
    text_file: `sct2_Description_Snapshot-en${snomed_file_suffix}`,
    schema: z.object({
      id: z.number().int(),
      effective_time,
      active,
      module_id: z.number().int(),
      concept_id: z.number().int(),
      language_code: z.string(),
      term: number_or_string_as_string,
      type_id: z.number().int(),
      case_significance_id: z.number().int(),
    }),
  },
  {
    table: 'snomed_cci_refset_refset_descriptor',
    text_file: `der2_cciRefset_RefsetDescriptorSnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      attribute_description: z.number().int(),
      attribute_type: z.number().int(),
      attribute_order: z.number().int(),
    }),
  },
  {
    table: 'snomed_ci_refset_description_type',
    text_file: `der2_ciRefset_DescriptionTypeSnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      description_format: z.number().int(),
      description_length: z.number().int(),
    }),
  },
  {
    table: 'snomed_cisscc_refset_mrcm_attribute_domain',
    text_file:
      `der2_cissccRefset_MRCMAttributeDomainSnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      domain_id: z.number().int(),
      grouped: z.coerce.boolean(),
      attribute_cardinality: z.string(),
      attribute_in_group_cardinality: z.string(),
      rule_strength_id: z.number().int(),
      content_type_id: z.number().int(),
    }),
  },
  {
    table: 'snomed_c_refset_association',
    text_file: `der2_cRefset_AssociationSnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      target_component_id: z.number().int(),
    }),
  },
  {
    table: 'snomed_c_refset_attribute_value',
    text_file: `der2_cRefset_AttributeValueSnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      value_id: z.number().int(),
    }),
  },
  {
    table: 'snomed_c_refset_language',
    text_file: `der2_cRefset_LanguageSnapshot-en${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      acceptability_id: z.number().int(),
    }),
  },
  {
    table: 'snomed_c_refset_mrcm_module_scope',
    text_file: `der2_cRefset_MRCMModuleScopeSnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      mrcm_rule_refset_id: z.number().int(),
    }),
  },
  {
    table: 'snomed_iissscc_refset_extended_map',
    text_file: `der2_iisssccRefset_ExtendedMapSnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      map_group: z.number().int(),
      map_priority: z.number().int(),
      map_rule: z.string().optional(),
      map_advice: z.string().optional(),
      map_target: number_or_string_as_string.nullable(),
      correlation_id: z.number().int(),
      map_category_id: z.number().int(),
    }),
  },
  {
    table: 'snomed_refset_simple',
    text_file: `der2_Refset_SimpleSnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
    }),
  },
  // {
  //   table: 'snomed_scs_refset_component_annotation_string_value',
  //   text_file:
  //     'der2_scsRefset_ComponentAnnotationStringValueSnapshot${snomed_file_suffix}.txt',
  //   schema: z.object({
  //     id: z.string(),
  //     effective_time,
  //     active,
  //     module_id: z.number().int(),
  //     refset_id: z.number().int(),
  //     referenced_component_id: z.number().int(),
  //     language_code: z.string(),
  //     type_id: z.number().int(),
  //     value: z.string().optional(),
  //   }),
  // },
  {
    table: 'snomed_s_refset_simple_map',
    text_file: `der2_sRefset_SimpleMapSnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      map_target: number_or_string_as_string,
    }),
  },
  {
    table: 'snomed_sscc_refset_mrcm_attribute_range',
    text_file:
      `der2_ssccRefset_MRCMAttributeRangeSnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      range_constraint: z.string(),
      attribute_rule: z.string(),
      rule_strength_id: z.number().int(),
      content_type_id: z.number().int(),
    }),
  },
  // {
  //   table: 'snomed_sscs_refset_member_annotation_string_value',
  //   text_file:
  //     `der2_sscsRefset_MemberAnnotationStringValueSnapshot${snomed_file_suffix}`,
  //   schema: z.object({
  //     id: z.string(),
  //     effective_time,
  //     active,
  //     module_id: z.number().int(),
  //     refset_id: z.number().int(),
  //     referenced_component_id: z.number().int(),
  //     referenced_member_id: z.string(),
  //     language_code: z.string(),
  //     type_id: z.number().int(),
  //     value: z.string().optional(),
  //   }),
  // },
  {
    table: 'snomed_ss_refset_module_dependency',
    text_file: `der2_ssRefset_ModuleDependencySnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      source_effective_time: effective_time,
      target_effective_time: effective_time,
    }),
  },
  {
    table: 'snomed_sssssss_refset_mrcm_domain',
    text_file: `der2_sssssssRefset_MRCMDomainSnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      domain_constraint: z.string(),
      parent_domain: z.string().nullable(),
      proximal_primitive_constraint: z.string(),
      proximal_primitive_refinement: z.string().nullable(),
      domain_template_for_precoordination: z.string(),
      domain_template_for_postcoordination: z.string(),
      guide_url: z.string().nullable(),
    }),
  },
  // This txt file is blank
  // {
  //   table: 'snomed_identifier',
  //   text_file: `sct2_Identifier_Snapshot${snomed_file_suffix}`,
  //   schema: z.object({
  //     alternate_identifier: z.string(),
  //     effective_time,
  //     active,
  //     module_id: z.number().int(),
  //     identifier_scheme_id: z.number().int(),
  //     referenced_component_id: z.number().int(),
  //   }),
  // },
  {
    table: 'snomed_relationship',
    text_file: `sct2_Relationship_Snapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.number().int(),
      effective_time,
      active,
      module_id: z.number().int(),
      source_id: z.number().int(),
      destination_id: z.number().int(),
      relationship_group: z.number().int(),
      type_id: z.number().int(),
      characteristic_type_id: z.number().int(),
      modifier_id: z.number().int(),
    }),
  },
  {
    table: 'snomed_relationship_concrete_values',
    text_file: `sct2_RelationshipConcreteValues_Snapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.number().int(),
      effective_time,
      active,
      module_id: z.number().int(),
      source_id: z.number().int(),
      value: z.string(),
      relationship_group: z.number().int(),
      type_id: z.number().int(),
      characteristic_type_id: z.number().int(),
      modifier_id: z.number().int(),
    }),
  },
  {
    table: 'snomed_s_refset_owl_expression',
    text_file: `sct2_sRefset_OWLExpressionSnapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.string(),
      effective_time,
      active,
      module_id: z.number().int(),
      refset_id: z.number().int(),
      referenced_component_id: z.number().int(),
      owl_expression: z.string(),
    }),
  },
  {
    table: 'snomed_stated_relationship',
    text_file: `sct2_StatedRelationship_Snapshot${snomed_file_suffix}`,
    schema: z.object({
      id: z.number().int(),
      effective_time,
      active,
      module_id: z.number().int(),
      source_id: z.number().int(),
      destination_id: z.number().int(),
      relationship_group: z.number().int(),
      type_id: z.number().int(),
      characteristic_type_id: z.number().int(),
      modifier_id: z.number().int(),
    }),
  },
  {
    table: 'snomed_text_definition',
    text_file: `sct2_TextDefinition_Snapshot-en${snomed_file_suffix}`,
    schema: z.object({
      id: z.number().int(),
      effective_time,
      active,
      module_id: z.number().int(),
      concept_id: z.number().int(),
      language_code: z.string(),
      type_id: z.number().int(),
      term: number_or_string_as_string,
      case_significance_id: z.number().int(),
    }),
  },
]

export default create([
  'snomed_concept',
  'snomed_description',
  'snomed_cci_refset_refset_descriptor',
  'snomed_ci_refset_description_type',
  'snomed_cisscc_refset_mrcm_attribute_domain',
  'snomed_c_refset_association',
  'snomed_c_refset_attribute_value',
  'snomed_c_refset_language',
  'snomed_c_refset_mrcm_module_scope',
  'snomed_iissscc_refset_extended_map',
  'snomed_refset_simple',
  // 'snomed_scs_refset_component_annotation_string_value',
  'snomed_s_refset_simple_map',
  'snomed_sscc_refset_mrcm_attribute_range',
  // 'snomed_sscs_refset_member_annotation_string_value',
  'snomed_ss_refset_module_dependency',
  'snomed_sssssss_refset_mrcm_domain',
  // 'snomed_identifier',
  'snomed_relationship',
  'snomed_relationship_concrete_values',
  'snomed_s_refset_owl_expression',
  'snomed_stated_relationship',
  'snomed_text_definition',
], async (trx) => {
  await ensureLatestSnomedExtractedAndFilesLayFlatInDirectory()

  const TEST_AGAINST_FILE_HEADS = false
  const snomed_directory = TEST_AGAINST_FILE_HEADS
    ? 'snomed-file-heads'
    : 'extracted/snomed'

  for (const { table, text_file, schema } of snomed_tables) {
    for await (
      const chunk of chunkTsvResource(
        `${snomed_directory}/${text_file}`,
        schema,
        {
          convert_to_snake_case: true,
          interpret_integers: true,
          quote: '⃤⃝', // Feeding a bogus unicode character we won't otherwise see allows quote characters to be ignored
        },
      )
    ) {
      await spinner(
        `Loading ${table}`,
        trx.insertInto(table).values(chunk).execute(),
      )
    }
  }
}, { never_dump: true })
