import { ExpressionBuilder, sql } from 'kysely'
import type { ExactTimeSpecification, RenderedSnomedConcept, TrxOrDbOrQueryCreator } from '../../types.ts'
import type { DB, SnomedCategory, SnomedInferredCanonicalNameAndCategory, SnomedRelationship } from '../../db.d.ts'
import { base } from './_base.ts'
import { asText, greatest, isSimilarWord, jsonArrayFrom, jsonObjectFrom, wordSimilarity } from '../helpers.ts'
import { SERVER_COUNTRY } from './countries.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import capitalize from '../../util/capitalize.ts'
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
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { positive_decimal, positive_integer } from '../../util/validators.ts'

type SearchTerms = {
  search?: string
  all_countries?: boolean
}

// A result of searching for a medication a patient might be taking: either a medicinal product
// named by its active ingredients, or a manufactured (brand) medication of one.
// See db/models/snomed_concept_medicinal_product.ts
export type MedicinalProductSearchResult = {
  id: string
  // The full name as in "Product containing only ..."
  name: string
  // How we display it as in "Amoxicillin"
  display: string
  // The active ingredients, when name is the brand name
  ingredients: RenderedSnomedConcept[]
  brands: {
    medication_id: string
    name: string
  }[]
}

export type MedicinalProductOptionIngredient = RenderedSnomedConcept & {
  strength: { value: number, units: string }
}

// One precise form of a medicinal product, from a clinical drug descended from it
export type MedicinalProductOption = {
  clinical_drug: RenderedSnomedConcept
  form: { name: string; category: SnomedCategory } | null
  route: { name: string; category: SnomedCategory } | null
  // The active ingredients, ordered by name, each with its own strength in this clinical drug
  ingredients: MedicinalProductOptionIngredient[]
  // What a single dose is counted in, e.g. "tablet" or "mL"
  dosage_units: string | null
  per_time?: ExactTimeSpecification | null
}

/*
  Searches the medications a patient might say they are taking.

  Always returns the SNOMED medicinal product, once, never a brand. A medicinal product is named for
  its active ingredients ("Product containing only cetirizine"), so a product matches when the
  search matches the name of a substance it contains only.

  The medications table holds manufactured (brand) medications, each linked to its medicinal
  product. A product also matches when the search matches the trade name of one of its brands.
  Its brands[] are then:
    - all of its brands, when the medicine itself matched
    - only the brands that matched, when the medicine did not (the search was only for a brand)
  A trade name registered in several forms is listed once.

  Unless all_countries is set, only brands with a medication_availabilities row in SERVER_COUNTRY
  count, both for matching a product by its trade name and for listing its brands[].
*/
function baseQuery(trx: TrxOrDbOrQueryCreator, { search, all_countries }: SearchTerms) {
  assertOr400(!search || search.trim().length >= 2, 'Must be searching for a term of at least 2 characters')
  const term = search?.trim()

  // Unless searching all countries, only the brands registered for sale in the server's country
  const brandIsAvailable = (eb: ExpressionBuilder<DB, 'medications'>) =>
    all_countries ? eb.lit(true) : eb.exists(
      eb.selectFrom('medication_availabilities')
        .whereRef('medication_availabilities.medication_id', '=', 'medications.id')
        .where('medication_availabilities.country', '=', SERVER_COUNTRY)
        .select(sql.lit(1).as('available')),
    )

  return trx
    .with('matching_substances', (qb) =>
      qb.selectFrom('snomed_description')
        .innerJoin('snomed_inferred_canonical_name_and_category as substance', 'substance.id', 'snomed_description.concept_id')
        .where('substance.category', '=', 'substance')
        .where('snomed_description.active', '=', true)
        .groupBy('snomed_description.concept_id')
        .$if(!!term, (qb) => qb.where((eb) => isSimilarWord(eb.ref('snomed_description.term'), term!)))
        .select((eb) => [
          'snomed_description.concept_id as id',
          eb.fn.max(
            wordSimilarity(eb.ref('snomed_description.term'), term ?? 'N/A'),
          ).as('similarity'),
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
          eb.fn.max('matching_substances.similarity').as('similarity'),
        ]))
    // The brands whose trade name matches the search
    .with('matching_brands', (qb) =>
      qb.selectFrom('medications')
        .innerJoin('snomed_inferred_canonical_name_and_category as product', (join) =>
          join.onRef('product.id', '=', 'medications.snomed_concept_id')
            .on('product.category', '=', 'medicinal product'))
        .where(brandIsAvailable)
        .where((eb) => term ? isSimilarWord(eb.ref('medications.trade_name'), term) : sql<boolean>`false`)
        .groupBy('product.id')
        .select((eb) => [
          'product.id',
          eb.fn.max(wordSimilarity(eb.ref('medications.trade_name'), term ?? 'N/A')).as('similarity'),
        ]))
    .with('matching_products', (qb) =>
      qb.selectFrom('generics')
        .select('generics.id')
        .union(qb.selectFrom('matching_brands').select('matching_brands.id')))
    .selectFrom('matching_products')
    .innerJoin('snomed_inferred_canonical_name_and_category as product', 'product.id', 'matching_products.id')
    .leftJoin('generics', 'generics.id', 'product.id')
    .leftJoin('matching_brands', 'matching_brands.id', 'product.id')
    .select((eb) => [
      asText(eb, 'product.id').as('id'),
      'product.name',
      greatest(
        eb.fn.coalesce('generics.similarity', eb.lit(0)),
        eb.fn.coalesce('matching_brands.similarity', eb.lit(0)),
      ).as('similarity'),
      eb.selectFrom('snomed_relationship as ingredient_count')
        .whereRef('ingredient_count.source_id', '=', 'product.id')
        .where('ingredient_count.type_id', '=', HAS_ACTIVE_INGREDIENT.id)
        .where('ingredient_count.active', '=', true)
        .select((eb_count) => eb_count.cast<number>(eb_count.fn.countAll(), 'integer').as('count'))
        .as('ingredient_count'),
      jsonArrayFrom(
        eb.selectFrom('snomed_relationship as has_active_ingredient')
          .innerJoin('snomed_inferred_canonical_name_and_category as substance', 'substance.id', 'has_active_ingredient.destination_id')
          .whereRef('has_active_ingredient.source_id', '=', 'product.id')
          .where('has_active_ingredient.type_id', '=', HAS_ACTIVE_INGREDIENT.id)
          .where('has_active_ingredient.active', '=', true)
          .select((eb_ingredient) => [
            asText(eb_ingredient, 'substance.id').as('snomed_concept_id'),
            'substance.name',
            'substance.category',
          ])
          .orderBy('substance.name'),
      ).as('ingredients'),
      // All the brands when the medicine matched, otherwise only the brands that did
      jsonArrayFrom(
        eb.selectFrom('medications')
          .whereRef('medications.snomed_concept_id', '=', 'product.id')
          .where(brandIsAvailable)
          .where((eb_brand) =>
            eb_brand.or([
              eb_brand('generics.id', 'is not', null),
              term ? isSimilarWord(eb_brand.ref('medications.trade_name'), term) : sql<boolean>`false`,
            ])
          )
          .distinctOn('medications.trade_name')
          .select(['medications.id as medication_id', 'medications.trade_name as name'])
          .orderBy('medications.trade_name')
          .orderBy('medications.id'),
      ).as('brands'),
    ])
    .orderBy('similarity', 'desc')
    // The fewest ingredients first
    .orderBy('ingredient_count', 'asc')
    .orderBy('product.name', 'asc')
    .orderBy('product.id', 'asc')
}

type SearchRow = Awaited<ReturnType<ReturnType<typeof baseQuery>['executeTakeFirstOrThrow']>>

export function activeIngredientsDisplay(medicinal_product_name: string): string {
  return medicinal_product_name
    .replace(/^Product containing (only |precisely )?/i, '')
    .replace(/ in .* dose form$/i, '')
    .replaceAll(/,? and /g, ' + ')
    .replaceAll(', ', ' + ')
}

function formatResult({ name, ...row }: SearchRow): MedicinalProductSearchResult {
  return {
    name,
    display: capitalize(activeIngredientsDisplay(name), { just_first: true }),
    ...row,
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
  return positive_decimal.parse(value.replace(/^#/, '')).toNumber()
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
  return trx
    .selectFrom('snomed_concept_active_descendants_realized as descendants')
    .innerJoin('snomed_inferred_canonical_name_and_category as clinical_drug', (join) =>
      join.onRef('clinical_drug.id', '=', 'descendants.descendant_id')
        .on('clinical_drug.category', '=', 'clinical drug'))
    .where(
      'descendants.ancestor_id',
      '=',
      'snomed_concept_id' in medicinal_product
        ? medicinal_product.snomed_concept_id
        : (eb) =>
          eb.selectFrom('snomed_inferred_canonical_name_and_category as named')
            .where('named.name', '=', medicinal_product.name)
            .where('named.category', '=', 'medicinal product')
            .select('named.id'),
    )
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
            asText(eb_ingredient, 'substance.id').as('substance_id'),
            'substance.name as substance_name',
            'substance.category as substance_category',
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
      ).as('ingredients'),
    ])
    .orderBy('clinical_drug.name')
}

const RATE_DENOMINATOR_UNITS = new Set(['hour'])

type OptionRow = Awaited<ReturnType<ReturnType<typeof optionsQuery>['executeTakeFirstOrThrow']>>

type CompleteIngredient = {
  substance_id: string
  substance_name: string
  substance_category: SnomedCategory
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
  const ingredients = row.ingredients.map((ingredient): CompleteIngredient => {
    const {
      substance_id,
      substance_name,
      substance_category,
      numerator_value,
      numerator_unit,
      denominator_value,
      denominator_unit,
      denominator_unit_category,
    } = ingredient

    assert(numerator_value, `Ingredient ${ingredient.substance_id} needs ${numerator_value}`)
    assert(numerator_unit, `Ingredient ${ingredient.substance_id} needs ${numerator_unit}`)
    assert(denominator_value, `Ingredient ${ingredient.substance_id} needs ${denominator_value}`)
    assert(denominator_unit, `Ingredient ${ingredient.substance_id} needs ${denominator_unit}`)
    assert(denominator_unit_category, `Ingredient ${ingredient.substance_id} needs ${denominator_unit_category}`)
    return {
      substance_id,
      substance_name,
      substance_category,
      numerator_value,
      numerator_unit,
      denominator_value,
      denominator_unit,
      denominator_unit_category,
    }
  })
  // Dosed by measure (mL, g) when strength is a concentration, but not by time when it is a release rate,
  // as in a patch's "2.5 milligram / 24 hour": that is dosed by the patch
  const liquid = ingredients.find((ingredient) =>
    ingredient.denominator_unit_category !== 'unit of presentation' && !RATE_DENOMINATOR_UNITS.has(ingredient.denominator_unit.toLowerCase())
  )
  const dosage_units = liquid ? unitDisplay(liquid.denominator_unit) : row.unit_of_presentation?.toLowerCase() ?? null

  const [first_ingredient, ...other_ingredients] = ingredients
  const first_ingredient_denominator_units = first_ingredient.denominator_unit
  const first_ingredient_denominator_value = concreteNumber(first_ingredient.denominator_value)
  if (first_ingredient_denominator_value !== 1) {
    assertEquals(first_ingredient_denominator_units, 'hour')
  } else {
    assertEquals(unitDisplay(first_ingredient_denominator_units), dosage_units)
  }

  for (const other_ingredient of other_ingredients) {
    const other_ingredient_denominator_units = other_ingredient.denominator_unit
    const other_ingredient_denominator_value = concreteNumber(other_ingredient.denominator_value)
    assertEquals(first_ingredient_denominator_units, other_ingredient_denominator_units)
    assertEquals(first_ingredient_denominator_value, other_ingredient_denominator_value)
  }

  return {
    clinical_drug: {
      snomed_concept_id: row.clinical_drug_id,
      name: row.clinical_drug_name,
      category: 'clinical drug',
    },
    form: row.form,
    route: row.route,
    ingredients: ingredients.map((ingredient): MedicinalProductOptionIngredient => ({
      snomed_concept_id: ingredient.substance_id,
      name: ingredient.substance_name,
      category: ingredient.substance_category,
      strength: {
        value: concreteNumber(ingredient.numerator_value),
        units: unitDisplay(ingredient.numerator_unit),
      },
    })),
    dosage_units,
    per_time: first_ingredient_denominator_units === 'hour'
      ? { value: positive_integer.parse(first_ingredient_denominator_value), units: first_ingredient_denominator_units }
      : null,
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
  top_level_table: 'product' as unknown as 'snomed_concept',
  baseQuery,
  formatResult,
  options,
})