import { ExpressionBuilder, RawBuilder, sql } from 'kysely'
import type { Maybe, RenderedMedication, TrxOrDbOrQueryCreator } from '../../types.ts'
import { asText, jsonArrayFrom, jsonBuildObject, success_true } from '../helpers.ts'
import { base, identity } from './_base.ts'
import { DB, SnomedInferredCanonicalNameAndCategory } from '../../db.d.ts'

export const medications = base({
  top_level_table: 'medications',
  baseQuery(trx: TrxOrDbOrQueryCreator, opts: { search?: Maybe<string> }) {
    const qb = trx
      .selectFrom('medications')
      .innerJoin('snomed_inferred_canonical_name_and_category as medication_snomed', 'medication_snomed.id', 'medications.snomed_concept_id')
      .select((eb) => [
        'medications.id',
        jsonBuildObject({
          snomed_concept_id: asText(eb, 'medication_snomed.id'),
          name: eb.ref('medication_snomed.name'),
          category: eb.ref('medication_snomed.category'),
        }).as('snomed_concept'),
        'medications.trade_name as name',
        'medications.applicant_name',
        'medications.form',
        'medications.routes',
        jsonArrayFrom(
          eb.selectFrom('medication_doses')
            .whereRef('medication_doses.medication_id', '=', 'medications.id')
            .select((eb_doses) => [
              'medication_doses.id as medication_dose_id',
              asText(eb_doses, 'medication_doses.value').as('value'),
              'medication_doses.description',
              'medication_doses.description_is_units',
              jsonArrayFrom(
                eb_doses.selectFrom('medication_dose_ingredients')
                  .innerJoin(
                    'snomed_inferred_canonical_name_and_category as ingredient_snomed',
                    'ingredient_snomed.id',
                    'medication_dose_ingredients.snomed_concept_id',
                  )
                  .innerJoin('medication_dose_ingredient_strengths', 'medication_dose_ingredient_strengths.id', 'medication_dose_ingredients.id')
                  .whereRef('medication_dose_ingredients.medication_dose_id', '=', 'medication_doses.id')
                  .select((eb_ingredients) => [
                    asText(eb_ingredients, 'medication_dose_ingredient_strengths.value').as('value'),
                    'medication_dose_ingredient_strengths.units',
                    jsonBuildObject({
                      snomed_concept_id: asText(eb_ingredients, 'ingredient_snomed.id'),
                      name: eb_ingredients.ref('ingredient_snomed.name'),
                      category: eb_ingredients.ref('ingredient_snomed.category'),
                    }).as('snomed_concept'),
                  ]),
              ).as('ingredients'),
            ]),
        ).as('doses'),
      ])

    if (!opts.search) return qb.orderBy('medications.trade_name', 'asc')

    const fuzzy = sql<boolean>`snomed_description.term % ${opts.search}`
    const exact = sql<boolean>`lower(snomed_description.term) = lower(${opts.search})`

    type EB = ExpressionBuilder<
      DB & {
        medication_snomed: SnomedInferredCanonicalNameAndCategory
      },
      'medications' | 'medication_snomed'
    >

    const medicationSnomedMatch = (eb: EB, condition: RawBuilder<boolean>) =>
      eb.exists(
        eb.selectFrom('snomed_description')
          .whereRef('snomed_description.concept_id', '=', 'medications.snomed_concept_id')
          .where(condition)
          .select(success_true),
      )

    const ingredientSnomedMatch = (eb: EB, condition: RawBuilder<boolean>) =>
      eb.exists(
        eb.selectFrom('medication_doses')
          .innerJoin('medication_dose_ingredients', 'medication_dose_ingredients.medication_dose_id', 'medication_doses.id')
          .innerJoin('snomed_description', 'snomed_description.concept_id', 'medication_dose_ingredients.snomed_concept_id')
          .whereRef('medication_doses.medication_id', '=', 'medications.id')
          .where(condition)
          .select(success_true),
      )

    return qb.where((eb) =>
      eb.or([
        sql<boolean>`${opts.search} <% trade_name`,
        medicationSnomedMatch(eb, fuzzy),
        ingredientSnomedMatch(eb, fuzzy),
      ])
    )
      .select([
        sql`word_similarity(${opts.search}, trade_name)`.as('similarity'),
      ])
      .orderBy((eb) => medicationSnomedMatch(eb, exact), 'desc')
      .orderBy((eb) => ingredientSnomedMatch(eb, exact), 'desc')
      .orderBy(sql`word_similarity(${opts.search}, trade_name)`, 'desc')
  },
  formatResult: identity<RenderedMedication>,
})
