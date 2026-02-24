import { ExpressionBuilder, RawBuilder, sql } from 'kysely'
import type { IdSelectable, Maybe, RenderedRecommendedDose, TrxOrDbOrQueryCreator } from '../../types.ts'
import { asText, jsonArrayFrom, jsonBuildNullableObject, jsonBuildObject, success_true } from '../helpers.ts'
import { base, identity } from './_base.ts'
import { DB, SnomedCategory, SnomedInferredCanonicalNameAndCategory } from '../../db.d.ts'

export const recommended_doses = base({
  verbose: true,
  top_level_table: 'recommended_doses',
  baseQuery(trx: TrxOrDbOrQueryCreator, opts: {
    search?: Maybe<string>
    indication_snomed_concept_id?: IdSelectable
    age?: number
    atc?: string
  }) {
    let qb = trx
      .selectFrom('recommended_doses')
      .innerJoin('snomed_inferred_canonical_name_and_category as medicine_snomed', 'medicine_snomed.id', 'recommended_doses.medicine_snomed_concept_id')
      .innerJoin('snomed_inferred_canonical_name_and_category as form_snomed', 'form_snomed.id', 'recommended_doses.form_snomed_concept_id')
      .innerJoin('snomed_inferred_canonical_name_and_category as route_snomed', 'route_snomed.id', 'recommended_doses.route_snomed_concept_id')
      .select((eb) => [
        'recommended_doses.id',
        jsonBuildObject({
          snomed_concept_id: asText(eb, 'medicine_snomed.id'),
          name: eb.ref('medicine_snomed.name'),
          category: eb.ref('medicine_snomed.category'),
        }).as('medicine'),
        jsonBuildObject({
          snomed_concept_id: asText(eb, 'form_snomed.id'),
          name: eb.ref('form_snomed.name'),
          category: eb.ref('form_snomed.category'),
        }).as('form'),
        jsonBuildObject({
          snomed_concept_id: asText(eb, 'route_snomed.id'),
          name: eb.ref('route_snomed.name'),
          category: eb.ref('route_snomed.category'),
        }).as('route'),
        asText(eb, 'recommended_doses.age_years_low').as('age_years_low'),
        sql<string | null>`${eb.ref('recommended_doses.age_years_high')}::text`.as('age_years_high'),
        'recommended_doses.special_instructions',
        'recommended_doses.prescriber',
        jsonArrayFrom(
          eb.selectFrom('recommended_dose_schedules')
            .whereRef('recommended_dose_schedules.recommended_dose_id', '=', 'recommended_doses.id')
            .orderBy('recommended_dose_schedules.order', 'asc')
            .select((eb_sched) => [
              'recommended_dose_schedules.frequency',
              'recommended_dose_schedules.other_frequency_options',
              sql<string | null>`${eb_sched.ref('recommended_dose_schedules.dosage')}::text`.as('dosage'),
              sql<string | null>`${eb_sched.ref('recommended_dose_schedules.duration')}::text`.as('duration'),
              'recommended_dose_schedules.duration_unit',
              jsonArrayFrom(
                eb_sched.selectFrom('recommended_dose_ingredients')
                  .innerJoin(
                    'snomed_inferred_canonical_name_and_category as ingredient_snomed',
                    'ingredient_snomed.id',
                    'recommended_dose_ingredients.active_ingredient_snomed_concept_id',
                  )
                  .leftJoin(
                    'recommended_dose_ingredient_strengths',
                    'recommended_dose_ingredient_strengths.id',
                    'recommended_dose_ingredients.id',
                  )
                  .leftJoin(
                    'snomed_inferred_canonical_name_and_category as units_snomed',
                    'units_snomed.id',
                    'recommended_dose_ingredient_strengths.units_snomed_concept_id',
                  )
                  .whereRef('recommended_dose_ingredients.recommended_dose_schedule_id', '=', 'recommended_dose_schedules.id')
                  .select((eb_ing) => [
                    jsonBuildObject({
                      snomed_concept_id: asText(eb_ing, 'ingredient_snomed.id'),
                      name: eb_ing.ref('ingredient_snomed.name'),
                      category: eb_ing.ref('ingredient_snomed.category'),
                    }).as('snomed_concept'),
                    jsonBuildNullableObject(
                      eb_ing.ref('recommended_dose_ingredient_strengths.id'),
                      {
                        value: sql<string | null>`${eb_ing.ref('recommended_dose_ingredient_strengths.value')}::text`,
                        value_low: sql<string | null>`${eb_ing.ref('recommended_dose_ingredient_strengths.value_low')}::text`,
                        value_high: sql<string | null>`${eb_ing.ref('recommended_dose_ingredient_strengths.value_high')}::text`,
                        units: jsonBuildNullableObject(
                          eb_ing.ref('units_snomed.id'),
                          {
                            snomed_concept_id: asText(eb_ing, 'units_snomed.id'),
                            name: sql<string>`${eb_ing.ref('units_snomed.name')}`,
                            category: sql<SnomedCategory>`${eb_ing.ref('units_snomed.category')}`,
                          },
                        ),
                      },
                    ).as('strength'),
                  ]),
              ).as('ingredients'),
            ]),
        ).as('schedules'),
      ])

    if (opts.indication_snomed_concept_id) {
      qb = qb.where((eb) =>
        eb.exists(
          eb.selectFrom('recommended_dose_indications')
            .whereRef('recommended_dose_indications.recommended_dose_id', '=', 'recommended_doses.id')
            .where(
              sql<boolean>`is_descendant(${
                sql.ref('recommended_dose_indications.indication_snomed_concept_id')
              }, ${opts.indication_snomed_concept_id}::bigint)`,
            )
            .select(success_true),
        )
      )
    }

    if (opts.atc) {
      qb = qb.where('recommended_doses.atc', '=', opts.atc)
    }

    if (opts.age !== undefined) {
      qb = qb
        .where(sql<boolean>`${sql.ref('recommended_doses.age_years_low')} <= ${opts.age}`)
        .where((eb) =>
          eb.or([
            eb('recommended_doses.age_years_high', 'is', null),
            sql<boolean>`${sql.ref('recommended_doses.age_years_high')} >= ${opts.age}`,
          ])
        )
    }

    if (!opts.search) return qb.orderBy('medicine_snomed.name', 'asc')

    const fuzzy = sql<boolean>`snomed_description.term % ${opts.search}`
    const exact = sql<boolean>`lower(snomed_description.term) = lower(${opts.search})`

    type EB = ExpressionBuilder<
      DB & {
        medicine_snomed: SnomedInferredCanonicalNameAndCategory
        form_snomed: SnomedInferredCanonicalNameAndCategory
        route_snomed: SnomedInferredCanonicalNameAndCategory
      },
      'recommended_doses' | 'medicine_snomed' | 'form_snomed' | 'route_snomed'
    >

    const medicineSnomedMatch = (eb: EB, condition: RawBuilder<boolean>) =>
      eb.exists(
        eb.selectFrom('snomed_description')
          .whereRef('snomed_description.concept_id', '=', 'recommended_doses.medicine_snomed_concept_id')
          .where(condition)
          .select(success_true),
      )

    return qb.where((eb) => medicineSnomedMatch(eb as unknown as EB, fuzzy))
      .orderBy((eb) => medicineSnomedMatch(eb as unknown as EB, exact), 'desc')
      .orderBy(sql`word_similarity(${opts.search}, medicine_snomed.name)`, 'desc')
  },
  formatResult: identity<RenderedRecommendedDose>,
})
