import { sql } from 'kysely'
import type { RenderedFullSnomedConcept, TrxOrDbOrQueryCreator } from '../../types.ts'
import type { SnomedCategory } from '../../db.d.ts'
import { asText, jsonArrayFrom } from '../helpers.ts'
import { base, identity } from './_base.ts'

type SearchTerms = {
  include_inactive?: boolean
  category?: SnomedCategory
  search?: string
}

export const rendered_snomed_concepts = base({
  top_level_table: 'snomed_concept',
  baseQuery(trx: TrxOrDbOrQueryCreator, opts: SearchTerms) {
    return trx
      .selectFrom('snomed_concept')
      .innerJoin(
        'snomed_inferred_canonical_name_and_category',
        'snomed_inferred_canonical_name_and_category.id',
        'snomed_concept.id',
      )
      .$if(!!opts.category, (qb) => qb.where('snomed_inferred_canonical_name_and_category.category', '=', opts.category!))
      .$if(!!opts.search, (qb) =>
        qb
          .where(sql<boolean>`${opts.search} <% snomed_inferred_canonical_name_and_category.name`)
          .orderBy(sql<number>`similarity(${opts.search}, snomed_inferred_canonical_name_and_category.name)`, 'desc'))
      .where('snomed_concept.active', '=', !opts?.include_inactive)
      .select((eb) => [
        asText(eb, 'snomed_concept.id').as('id'),
        'snomed_inferred_canonical_name_and_category.name',
        'snomed_inferred_canonical_name_and_category.category',
        'snomed_concept.active',
        jsonArrayFrom(
          eb.selectFrom('snomed_description')
            .whereRef('snomed_description.concept_id', '=', 'snomed_concept.id')
            .where('snomed_description.active', '=', true)
            .select((eb_d) => [
              asText(eb_d, 'snomed_description.id').as('id'),
              'snomed_description.term',
              'snomed_description.language_code',
              asText(eb_d, 'snomed_description.type_id').as('type_id'),
            ])
            .orderBy('snomed_description.term'),
        ).as('descriptions'),
        jsonArrayFrom(
          eb.selectFrom('snomed_text_definition')
            .whereRef('snomed_text_definition.concept_id', '=', 'snomed_concept.id')
            .where('snomed_text_definition.active', '=', true)
            .select((eb_td) => [
              asText(eb_td, 'snomed_text_definition.id').as('id'),
              'snomed_text_definition.term',
              'snomed_text_definition.language_code',
            ])
            .orderBy('snomed_text_definition.language_code'),
        ).as('text_definitions'),
        jsonArrayFrom(
          eb.selectFrom('snomed_relationship')
            .innerJoin(
              'snomed_inferred_canonical_name_and_category as rel_type',
              'rel_type.id',
              'snomed_relationship.type_id',
            )
            .innerJoin(
              'snomed_inferred_canonical_name_and_category as rel_dest',
              'rel_dest.id',
              'snomed_relationship.destination_id',
            )
            .whereRef('snomed_relationship.source_id', '=', 'snomed_concept.id')
            .where('snomed_relationship.active', '=', true)
            .select((eb_r) => [
              asText(eb_r, 'snomed_relationship.id').as('id'),
              'snomed_relationship.relationship_group',
              asText(eb_r, 'snomed_relationship.type_id').as('type_id'),
              'rel_type.name as type_name',
              asText(eb_r, 'snomed_relationship.destination_id').as('destination_id'),
              'rel_dest.name as destination_name',
              'rel_dest.category as destination_category',
            ])
            .orderBy('snomed_relationship.relationship_group')
            .orderBy('rel_type.name'),
        ).as('relationships'),
        jsonArrayFrom(
          eb.selectFrom('snomed_stated_relationship')
            .innerJoin(
              'snomed_inferred_canonical_name_and_category as sr_type',
              'sr_type.id',
              'snomed_stated_relationship.type_id',
            )
            .innerJoin(
              'snomed_inferred_canonical_name_and_category as sr_dest',
              'sr_dest.id',
              'snomed_stated_relationship.destination_id',
            )
            .whereRef('snomed_stated_relationship.source_id', '=', 'snomed_concept.id')
            .where('snomed_stated_relationship.active', '=', true)
            .select((eb_sr) => [
              asText(eb_sr, 'snomed_stated_relationship.id').as('id'),
              'snomed_stated_relationship.relationship_group',
              asText(eb_sr, 'snomed_stated_relationship.type_id').as('type_id'),
              'sr_type.name as type_name',
              asText(eb_sr, 'snomed_stated_relationship.destination_id').as('destination_id'),
              'sr_dest.name as destination_name',
              'sr_dest.category as destination_category',
            ])
            .orderBy('snomed_stated_relationship.relationship_group')
            .orderBy('sr_type.name'),
        ).as('stated_relationships'),
        jsonArrayFrom(
          eb.selectFrom('snomed_relationship_concrete_values')
            .innerJoin(
              'snomed_inferred_canonical_name_and_category as cv_type',
              'cv_type.id',
              'snomed_relationship_concrete_values.type_id',
            )
            .whereRef('snomed_relationship_concrete_values.source_id', '=', 'snomed_concept.id')
            .where('snomed_relationship_concrete_values.active', '=', true)
            .select((eb_cv) => [
              asText(eb_cv, 'snomed_relationship_concrete_values.id').as('id'),
              'snomed_relationship_concrete_values.relationship_group',
              asText(eb_cv, 'snomed_relationship_concrete_values.type_id').as('type_id'),
              'cv_type.name as type_name',
              'snomed_relationship_concrete_values.value',
            ])
            .orderBy('snomed_relationship_concrete_values.relationship_group')
            .orderBy('cv_type.name'),
        ).as('concrete_values'),
      ])
  },
  formatResult: identity<RenderedFullSnomedConcept>,
})
