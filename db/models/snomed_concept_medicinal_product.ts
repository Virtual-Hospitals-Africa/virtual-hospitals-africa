import { ExpressionBuilder, sql } from 'kysely'
import type { MedicinalProductOption, MedicinalProductSearchResult, TrxOrDbOrQueryCreator } from '../../types.ts'
import type { DB, SnomedCategory, SnomedInferredCanonicalNameAndCategory, SnomedRelationship } from '../../db.d.ts'
import { base } from './_base.ts'
import { asText, jsonArrayFrom, jsonObjectFrom } from '../helpers.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import capitalize from '../../util/capitalize.ts'
import compact from '../../util/compact.ts'
import { activeIngredientsDisplay, MedicationMeasurement } from '../../shared/medication_s_expression.ts'
import {
  HAS_ACTIVE_INGREDIENT,
  HAS_BASIC_DOSE_FORM,
  HAS_CONCENTRATION_STRENGTH_DENOMINATOR_UNIT,
  HAS_CONCENTRATION_STRENGTH_DENOMINATOR_VALUE,
  HAS_CONCENTRATION_STRENGTH_NUMERATOR_UNIT,
  HAS_CONCENTRATION_STRENGTH_NUMERATOR_VALUE,
  HAS_DOSE_FORM_INTENDED_SITE,
  HAS_MANUFACTURED_DOSE_FORM,
  HAS_PRECISE_ACTIVE_INGREDIENT,
  HAS_PRESENTATION_STRENGTH_DENOMINATOR_UNIT,
  HAS_PRESENTATION_STRENGTH_DENOMINATOR_VALUE,
  HAS_PRESENTATION_STRENGTH_NUMERATOR_UNIT,
  HAS_PRESENTATION_STRENGTH_NUMERATOR_VALUE,
  HAS_UNIT_OF_PRESENTATION,
} from '../../shared/snomed_concepts.ts'

type SearchTerms = {
  search: string
}

/*
  Searches the medications a patient might say they are taking.

  A medicinal product is named for its active ingredients ("Product containing only cetirizine"),
  so the search is against the names of substances, returning the products that contain only the
  matching substances. Those are the generic results.

  The medications table holds manufactured (brand) medications, each linked to its medicinal
  product. Brand results are the trade names that either match the search themselves or are
  brands of a generic result. A trade name registered in several forms is returned once.
*/
function baseQuery(trx: TrxOrDbOrQueryCreator, { search }: SearchTerms) {
  assertOr400(search && search.trim().length >= 2, 'Must be searching for a term of at least 2 characters')
  const term = search.trim()

  // Kysely has no builders for the trigram word similarity operator and function
  const substance_term_matches = sql<boolean>`${term} <% snomed_description.term`
  const substance_term_similarity = sql<number>`word_similarity(${term}, snomed_description.term)`
  const trade_name_matches = sql<boolean>`${term} <% medications.trade_name`
  const trade_name_similarity = sql<number>`word_similarity(${term}, medications.trade_name)`

  return trx
    .with('matching_substances', (qb) =>
      qb.selectFrom('snomed_description')
        .innerJoin('snomed_inferred_canonical_name_and_category as substance', 'substance.id', 'snomed_description.concept_id')
        .where('substance.category', '=', 'substance')
        .where('snomed_description.active', '=', true)
        .where(substance_term_matches)
        .groupBy('snomed_description.concept_id')
        .select((eb) => [
          'snomed_description.concept_id as id',
          eb.fn.max(substance_term_similarity).as('similarity'),
        ]))
    .with('generics', (qb) =>
      qb.selectFrom('matching_substances')
        .innerJoin('snomed_relationship as has_active_ingredient', (join) =>
          join.onRef('has_active_ingredient.destination_id', '=', 'matching_substances.id')
            .on('has_active_ingredient.type_id', '=', HAS_ACTIVE_INGREDIENT.id)
            .on('has_active_ingredient.active', '=', true))
        .innerJoin('snomed_inferred_canonical_name_and_category as product', (join) =>
          join.onRef('product.id', '=', 'has_active_ingredient.source_id')
            .on('product.category', '=', 'medicinal product')
            .on('product.name', 'like', 'Product containing only %'))
        .groupBy(['product.id', 'product.name'])
        .select((eb) => [
          'product.id',
          'product.name',
          eb.fn.max('matching_substances.similarity').as('similarity'),
          eb.selectFrom('snomed_relationship as ingredients')
            .whereRef('ingredients.source_id', '=', 'product.id')
            .where('ingredients.type_id', '=', HAS_ACTIVE_INGREDIENT.id)
            .where('ingredients.active', '=', true)
            .select((eb_ingredients) => eb_ingredients.cast<number>(eb_ingredients.fn.countAll(), 'integer').as('count'))
            .as('ingredient_count'),
        ]))
    .with('brands', (qb) =>
      qb.selectFrom('medications')
        .innerJoin('snomed_inferred_canonical_name_and_category as product', (join) =>
          join.onRef('product.id', '=', 'medications.snomed_concept_id')
            .on('product.category', '=', 'medicinal product'))
        .leftJoin('generics', 'generics.id', 'medications.snomed_concept_id')
        .where((eb) => eb.or([trade_name_matches, eb('generics.id', 'is not', null)]))
        .distinctOn('medications.trade_name')
        .orderBy('medications.trade_name')
        .orderBy('medications.id')
        .select((eb) => [
          'medications.id',
          'medications.trade_name',
          'product.id as snomed_concept_id',
          'product.name as medicinal_product_name',
          eb.fn<number>('greatest', [
            eb.case().when(trade_name_matches).then(trade_name_similarity).else(0).end(),
            eb.fn.coalesce('generics.similarity', eb.lit(0)),
          ]).as('similarity'),
          eb.fn.coalesce('generics.ingredient_count', eb.lit(1)).as('ingredient_count'),
        ]))
    .selectFrom((eb) =>
      eb.selectFrom('generics')
        .select((eb_generics) => [
          asText(eb_generics, 'generics.id').as('id'),
          asText(eb_generics, 'generics.id').as('snomed_concept_id'),
          'generics.name as medicinal_product_name',
          eb_generics.cast<string | null>(eb_generics.lit(null), 'uuid').as('medication_id'),
          eb_generics.cast<string | null>(eb_generics.lit(null), 'text').as('brand_name'),
          eb_generics.fn.coalesce('generics.ingredient_count', eb_generics.lit(1)).as('ingredient_count'),
          eb_generics.fn.coalesce('generics.similarity', eb_generics.lit(0)).as('similarity'),
        ])
        .unionAll(
          eb.selectFrom('brands')
            .select((eb_brands) => [
              asText(eb_brands, 'brands.id').as('id'),
              asText(eb_brands, 'brands.snomed_concept_id').as('snomed_concept_id'),
              'brands.medicinal_product_name',
              eb_brands.cast<string | null>('brands.id', 'uuid').as('medication_id'),
              eb_brands.cast<string | null>('brands.trade_name', 'text').as('brand_name'),
              eb_brands.fn.coalesce('brands.ingredient_count', eb_brands.lit(1)).as('ingredient_count'),
              eb_brands.fn.coalesce('brands.similarity', eb_brands.lit(0)).as('similarity'),
            ]),
        )
        .as('results')
    )
    .selectAll('results')
    .orderBy('results.similarity', 'desc')
    // Generic before brand, and the fewest ingredients first
    .orderBy((eb) => eb('results.brand_name', 'is not', null), 'asc')
    .orderBy('results.ingredient_count', 'asc')
    .orderBy((eb) => eb.fn.coalesce('results.brand_name', 'results.medicinal_product_name'), 'asc')
    .orderBy('results.id', 'asc')
}

type SearchRow = Awaited<ReturnType<ReturnType<typeof baseQuery>['executeTakeFirstOrThrow']>>

function formatResult(row: SearchRow): MedicinalProductSearchResult {
  const ingredients = capitalize(activeIngredientsDisplay(row.medicinal_product_name), { just_first: true })
  return {
    id: row.id,
    name: row.brand_name ?? ingredients,
    description: row.brand_name ? ingredients : null,
    snomed_concept: {
      snomed_concept_id: row.snomed_concept_id,
      name: row.medicinal_product_name,
      category: 'medicinal product',
    },
    medication_id: row.medication_id,
    brand_name: row.brand_name,
  }
}

// Abbreviations for the units SNOMED measures strength in. Anything else is used as named.
const UNIT_ABBREVIATIONS: Record<string, string> = {
  'milligram': 'mg',
  'gram': 'g',
  'microgram': 'mcg',
  'nanogram': 'ng',
  'milliliter': 'mL',
  'microliter': 'µL',
  'international unit': 'IU',
  'unit': 'unit',
  'million unit': 'MU',
  'hour': 'h',
}

function unitDisplay(snomed_unit_name: string) {
  const lower = snomed_unit_name.toLowerCase()
  return UNIT_ABBREVIATIONS[lower] ?? lower.replaceAll(' ', '-')
}

// SNOMED concrete values are spelled "#500"
function concreteNumber(value: string) {
  return value.replace(/^#/, '')
}

type ClinicalDrugTables = DB & { clinical_drug: SnomedInferredCanonicalNameAndCategory }
type ClinicalDrugEB = ExpressionBuilder<ClinicalDrugTables, 'clinical_drug'>
type IngredientEB = ExpressionBuilder<ClinicalDrugTables & { ingredient: SnomedRelationship }, 'clinical_drug' | 'ingredient'>

// An attribute (basic dose form, intended site) of the dose form the clinical drug is manufactured in
function doseFormAttribute(eb: ClinicalDrugEB, attribute: { id: string }) {
  return eb.selectFrom('snomed_relationship as manufactured_dose_form')
    .innerJoin('snomed_relationship as dose_form_attribute', (join) =>
      join.onRef('dose_form_attribute.source_id', '=', 'manufactured_dose_form.destination_id')
        .on('dose_form_attribute.type_id', '=', attribute.id)
        .on('dose_form_attribute.active', '=', true))
    .innerJoin('snomed_inferred_canonical_name_and_category as value_concept', 'value_concept.id', 'dose_form_attribute.destination_id')
    .whereRef('manufactured_dose_form.source_id', '=', 'clinical_drug.id')
    .where('manufactured_dose_form.type_id', '=', HAS_MANUFACTURED_DOSE_FORM.id)
    .where('manufactured_dose_form.active', '=', true)
    .select(['value_concept.name', 'value_concept.category'])
    .orderBy('value_concept.name')
    .limit(1)
}

// The number in the ingredient's relationship group for one side of its strength
function strengthValue(eb: IngredientEB, attribute: { id: string }) {
  return eb.selectFrom('snomed_relationship_concrete_values as concrete')
    .whereRef('concrete.source_id', '=', 'clinical_drug.id')
    .whereRef('concrete.relationship_group', '=', 'ingredient.relationship_group')
    .where('concrete.type_id', '=', attribute.id)
    .where('concrete.active', '=', true)
    .select('concrete.value')
    .limit(1)
}

// The unit in the ingredient's relationship group for one side of its strength
function strengthUnit(eb: IngredientEB, attribute: { id: string }) {
  return eb.selectFrom('snomed_relationship as unit_relationship')
    .innerJoin('snomed_inferred_canonical_name_and_category as unit', 'unit.id', 'unit_relationship.destination_id')
    .whereRef('unit_relationship.source_id', '=', 'clinical_drug.id')
    .whereRef('unit_relationship.relationship_group', '=', 'ingredient.relationship_group')
    .where('unit_relationship.type_id', '=', attribute.id)
    .where('unit_relationship.active', '=', true)
    .limit(1)
}

function optionsQuery(
  trx: TrxOrDbOrQueryCreator,
  medicinal_product: { snomed_concept_id: string } | { name: string },
) {
  const clinical_drugs = trx
    .selectFrom('snomed_concept_active_descendants_realized as descendants')
    .innerJoin('snomed_inferred_canonical_name_and_category as clinical_drug', (join) =>
      join.onRef('clinical_drug.id', '=', 'descendants.descendant_id')
        .on('clinical_drug.category', '=', 'clinical drug'))

  // A medication's s-expression names its medicinal product, so it can be looked up by name too
  const of_medicinal_product = 'snomed_concept_id' in medicinal_product
    ? clinical_drugs.where('descendants.ancestor_id', '=', medicinal_product.snomed_concept_id)
    : clinical_drugs.where(
      'descendants.ancestor_id',
      '=',
      (eb) =>
        eb.selectFrom('snomed_inferred_canonical_name_and_category as named')
          .where('named.name', '=', medicinal_product.name)
          .where('named.category', '=', 'medicinal product')
          .select('named.id'),
    )

  return of_medicinal_product
    .select((eb) => [
      asText(eb, 'clinical_drug.id').as('clinical_drug_id'),
      'clinical_drug.name as clinical_drug_name',
      jsonObjectFrom(doseFormAttribute(eb, HAS_BASIC_DOSE_FORM)).as('form'),
      jsonObjectFrom(doseFormAttribute(eb, HAS_DOSE_FORM_INTENDED_SITE)).as('route'),
      eb.selectFrom('snomed_relationship as has_unit_of_presentation')
        .innerJoin('snomed_inferred_canonical_name_and_category as unit_of_presentation', 'unit_of_presentation.id', 'has_unit_of_presentation.destination_id')
        .whereRef('has_unit_of_presentation.source_id', '=', 'clinical_drug.id')
        .where('has_unit_of_presentation.type_id', '=', HAS_UNIT_OF_PRESENTATION.id)
        .where('has_unit_of_presentation.active', '=', true)
        .select('unit_of_presentation.name')
        .limit(1)
        .as('unit_of_presentation'),
      // Presentation strength (per tablet) is preferred to concentration strength (per mL) when a clinical drug has both
      jsonArrayFrom(
        eb.selectFrom('snomed_relationship as ingredient')
          .innerJoin('snomed_inferred_canonical_name_and_category as substance', 'substance.id', 'ingredient.destination_id')
          .whereRef('ingredient.source_id', '=', 'clinical_drug.id')
          .where('ingredient.type_id', '=', HAS_PRECISE_ACTIVE_INGREDIENT.id)
          .where('ingredient.active', '=', true)
          .select((eb_ingredient) => [
            'substance.name as substance_name',
            eb_ingredient.fn.coalesce(
              strengthValue(eb_ingredient, HAS_PRESENTATION_STRENGTH_NUMERATOR_VALUE),
              strengthValue(eb_ingredient, HAS_CONCENTRATION_STRENGTH_NUMERATOR_VALUE),
            ).as('numerator_value'),
            eb_ingredient.fn.coalesce(
              strengthUnit(eb_ingredient, HAS_PRESENTATION_STRENGTH_NUMERATOR_UNIT).select('unit.name'),
              strengthUnit(eb_ingredient, HAS_CONCENTRATION_STRENGTH_NUMERATOR_UNIT).select('unit.name'),
            ).as('numerator_unit'),
            eb_ingredient.fn.coalesce(
              strengthValue(eb_ingredient, HAS_PRESENTATION_STRENGTH_DENOMINATOR_VALUE),
              strengthValue(eb_ingredient, HAS_CONCENTRATION_STRENGTH_DENOMINATOR_VALUE),
            ).as('denominator_value'),
            eb_ingredient.fn.coalesce(
              strengthUnit(eb_ingredient, HAS_PRESENTATION_STRENGTH_DENOMINATOR_UNIT).select('unit.name'),
              strengthUnit(eb_ingredient, HAS_CONCENTRATION_STRENGTH_DENOMINATOR_UNIT).select('unit.name'),
            ).as('denominator_unit'),
            eb_ingredient.fn.coalesce(
              strengthUnit(eb_ingredient, HAS_PRESENTATION_STRENGTH_DENOMINATOR_UNIT).select('unit.category'),
              strengthUnit(eb_ingredient, HAS_CONCENTRATION_STRENGTH_DENOMINATOR_UNIT).select('unit.category'),
            ).as('denominator_unit_category'),
          ])
          .orderBy('substance.name'),
      ).as('strengths'),
    ])
    .orderBy('clinical_drug.name')
}

type OptionRow = Awaited<ReturnType<ReturnType<typeof optionsQuery>['executeTakeFirstOrThrow']>>

type CompleteStrength = {
  numerator_value: string
  numerator_unit: string
  denominator_value: string
  denominator_unit: string
  denominator_unit_category: SnomedCategory
}

/*
  "500 milligram / 1 Tablet" is a strength of 500mg, taken a tablet at a time.
  "50 milligram / 1 Milliliter" is a strength of 50mg/mL, taken a mL at a time.
*/
function asOption(row: OptionRow): MedicinalProductOption {
  const strengths = compact(row.strengths.map((strength): CompleteStrength | null => {
    const { numerator_value, numerator_unit, denominator_value, denominator_unit, denominator_unit_category } = strength
    if (!numerator_value || !numerator_unit || !denominator_value || !denominator_unit || !denominator_unit_category) return null
    return { numerator_value, numerator_unit, denominator_value, denominator_unit, denominator_unit_category }
  }))
  const liquid = strengths.find((strength) => strength.denominator_unit_category !== 'unit of presentation')

  return {
    clinical_drug: {
      snomed_concept_id: row.clinical_drug_id,
      name: row.clinical_drug_name,
      category: 'clinical drug',
    },
    form: row.form,
    route: row.route,
    strengths: strengths.map((strength): MedicationMeasurement => {
      const numerator_unit = unitDisplay(strength.numerator_unit)
      if (strength.denominator_unit_category === 'unit of presentation') {
        return { value: concreteNumber(strength.numerator_value), units: numerator_unit }
      }
      const denominator_value = concreteNumber(strength.denominator_value)
      return {
        value: concreteNumber(strength.numerator_value),
        units: compact([numerator_unit, '/', denominator_value !== '1' && denominator_value, unitDisplay(strength.denominator_unit)]).join(''),
      }
    }),
    dosage_units: liquid ? unitDisplay(liquid.denominator_unit) : row.unit_of_presentation?.toLowerCase() ?? null,
  }
}

/*
  The forms, routes and strengths a medicinal product comes in. A medicinal product only says
  what its active ingredients are; the clinical drugs descended from it each say precisely which
  dose form, at what strength. When every clinical drug agrees on a form, route or strength, it
  is implied by the medicinal product and need not be asked or recorded.
*/
async function options(
  trx: TrxOrDbOrQueryCreator,
  medicinal_product: { snomed_concept_id: string } | { name: string },
): Promise<MedicinalProductOption[]> {
  const rows = await optionsQuery(trx, medicinal_product).execute()
  return rows.map(asOption)
}

export const snomed_concept_medicinal_product = base({
  top_level_table: 'snomed_concept',
  baseQuery,
  formatResult,
  options,
})
