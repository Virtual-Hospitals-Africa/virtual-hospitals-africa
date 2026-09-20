import { IdSelectable, SnomedWarningSignSearchResult, TrxOrDbOrQueryCreator } from '../../types.ts'
import { base } from './_base.ts'
import { AgeDetermination } from '../../db.d.ts'
import { asConceptSExpression, FINDING_SITE } from '../../shared/snomed_concepts.ts'
import { snomed_concept_finding_like } from './snomed_concept_finding_like.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { snomed_onset_required } from './snomed_onset_required.ts'
import { snomed_predefined_attributes } from './snomed_predefined_attributes.ts'
import { snomed_relevant_qualifiers } from './snomed_relevant_qualifiers.ts'
import { sql } from 'kysely'
import { insertableFindingFullDisplay } from '../../shared/patient_records.ts'

type SearchTerms = {
  search?: string
  snomed_concept_id?: IdSelectable
  age_determination: AgeDetermination
  pregnancy?: boolean
  // The name of a body structure. Only findings sited within it, around it, or nowhere in particular are returned
  finding_site?: string
}

/*
  With a finding_site chosen, a finding passes when it has no predefined site of its own,
  or its predefined site lies within the chosen site or contains it. Findings sited elsewhere
  are dropped. Those sited within the chosen site rank first, then those whose site contains
  it, then those with no site. The result's finding_site is
  the more specific of the two, and the s_expression names the chosen site only when that is
  the more specific, as a predefined site is already implied by the concept.
*/
export const snomed_warning_signs = base({
  top_level_table: 'snomed_concept_finding_like',
  baseQuery(trx: TrxOrDbOrQueryCreator, { age_determination, pregnancy, finding_site, ...terms }: SearchTerms) {
    const predefined_within_chosen = sql<boolean>`predefined_within_chosen.descendant_id is not null`
    const chosen_within_predefined = sql<boolean>`chosen_within_predefined.descendant_id is not null`
    const predefined_is_more_specific = sql<boolean>`(${predefined_within_chosen} and predefined_site.id != chosen_site.id)`

    return trx.selectFrom(
      snomed_concept_finding_like.baseQuery(trx, terms)
        .as('results'),
    )
      .leftJoin(
        'snomed_concept_prioritizations',
        (join) =>
          join
            .onRef('snomed_concept_prioritizations.id', '=', 'results.id')
            .on('snomed_concept_prioritizations.age_determination', '=', age_determination)
            .on('snomed_concept_prioritizations.pregnancy', '=', !!pregnancy),
      )
      .leftJoin(
        trx.selectFrom('snomed_inferred_canonical_name_and_category')
          .where('name', '=', finding_site ?? '')
          .where('category', '=', 'body structure')
          .select(['id', 'name'])
          .limit(1)
          .as('chosen_site'),
        (join) => join.onTrue(),
      )
      .leftJoinLateral(
        (eb) =>
          eb.selectFrom('snomed_relationship')
            .innerJoin('snomed_inferred_canonical_name_and_category as site', 'site.id', 'snomed_relationship.destination_id')
            .whereRef('snomed_relationship.source_id', '=', 'results.id')
            .where('snomed_relationship.type_id', '=', FINDING_SITE.id)
            .where('snomed_relationship.active', '=', true)
            .select(['site.id', 'site.name'])
            .limit(1)
            .as('predefined_site'),
        (join) => join.onTrue(),
      )
      .leftJoin(
        'snomed_concept_active_descendants_realized as predefined_within_chosen',
        (join) =>
          join
            .onRef('predefined_within_chosen.ancestor_id', '=', 'chosen_site.id')
            .onRef('predefined_within_chosen.descendant_id', '=', 'predefined_site.id'),
      )
      .leftJoin(
        'snomed_concept_active_descendants_realized as chosen_within_predefined',
        (join) =>
          join
            .onRef('chosen_within_predefined.ancestor_id', '=', 'predefined_site.id')
            .onRef('chosen_within_predefined.descendant_id', '=', 'chosen_site.id'),
      )
      .where((eb) =>
        eb.or([
          eb('chosen_site.id', 'is', null),
          eb('predefined_site.id', 'is', null),
          predefined_within_chosen,
          chosen_within_predefined,
        ])
      )
      .selectAll('results')
      .select((eb) => [
        'snomed_concept_prioritizations.priority',
        'snomed_concept_prioritizations.warning_sign as priority_by_virtue_of_matching_warning_sign',
        eb.case()
          .when('chosen_site.id', 'is', null).then(sql<string | null>`null`)
          .when(predefined_is_more_specific).then(eb.ref('predefined_site.name'))
          .else(eb.ref('chosen_site.name'))
          .end()
          .as('chosen_finding_site_name'),
        sql<boolean>`coalesce(${predefined_within_chosen}, false)`.as('finding_site_is_predefined'),
        jsonArrayFrom(
          snomed_predefined_attributes.baseQuery(trx, {
            snomed_concept: eb.ref('results.id'),
          }),
        ).as('predefined_attributes'),
        jsonArrayFrom(
          snomed_relevant_qualifiers.baseQuery(trx, {
            snomed_concept: eb.ref('results.id'),
          }),
        ).as('relevant_qualifiers'),
        eb.exists(
          snomed_onset_required.baseQuery(trx, {
            snomed_concept: eb.ref('results.id'),
          }),
        ).$castTo<boolean>().as('onset_required'),
      ])
      .orderBy(
        sql`(case when chosen_site.id is null or predefined_site.id is null then 0 when ${predefined_within_chosen} then 2 else 1 end)`,
        'desc',
      )
      .orderBy('results.best_similarity', 'desc')
  },
  formatResult({ id: snomed_concept_id, chosen_finding_site_name, finding_site_is_predefined, ...result }): SnomedWarningSignSearchResult {
    const concept_s_expression = asConceptSExpression(result)
    const chosen_finding_site = chosen_finding_site_name ? { name: chosen_finding_site_name, category: 'body structure' as const } : null
    const site_s_expression = chosen_finding_site && !finding_site_is_predefined ? ` (finding_site ${asConceptSExpression(chosen_finding_site)})` : ''
    const clinical_finding_s_expression = `(clinical_finding ${concept_s_expression}${site_s_expression})`
    return {
      ...result,
      name: insertableFindingFullDisplay(clinical_finding_s_expression),
      clinical_finding_s_expression,
      snomed_concept_id,
      chosen_finding_site,
      category: 'Search Results' as const,
      description: result.category,
    }
  },
})

// Unused, but stashing because it's an interesting idea.
// The idea is to get the triage level of a finding already in the database based on
// The warning signs.
// async function getPriorityByRecordId(): Promise<Priority> {
//   const { priority } = await trx.selectFrom('patient_records')
//     .where('patient_records.id', '=', finding_insert.finding_id)
//     .select((eb) =>
//       snomed_model.getPriorityOfSnomedConcept(
//         eb,
//         'patient_records.specific_snomed_concept_id',
//         patient_id,
//         trx,
//       )
//     )
//     .executeTakeFirstOrThrow()

//   return priority?.name || 'Non-urgent'
// }

// function getPriorityOfSnomedConcept<
//   // deno-lint-ignore no-explicit-any
//   EB extends ExpressionBuilder<DB, any>,
// >(
//   eb: EB,
//   column_ref: Parameters<EB['ref']>[0],
//   patient_id: string,
//   trx: TrxOrDbOrQueryCreator,
// ) {
//   const [first_sign, ...rest] = WARNING_SIGNS.adult

//   // Build the predicate for a warning sign, including prompt_when check if present
//   const buildSignPredicate = (sign: typeof first_sign) => {
//     const finding_predicate = buildExpressionPredicate(
//       eb,
//       column_ref,
//       findingQueryExpression(sign),
//     )

//     if (!sign.prompt_when_s_expression) {
//       return finding_predicate
//     }

//     // TODO: probably move this idea into db/models/s_expression.ts
//     // Build the prompt_when check for the patient
//     // Handle 'not' expressions specially: use NOT EXISTS instead of EXISTS on the negated query
//     const parsed = parseWithSchema(sign.prompt_when_s_expression, any_query)

//     const prompt_when = isAtom(parsed, 'not')
//       ? eb.not(eb.exists(buildExpression(
//         trx,
//         { patient_id },
//         parsed.expression,
//       )))
//       : eb.exists(
//         buildExpression(
//           trx,
//           { patient_id },
//           parsed,
//         ),
//       )

//     return eb.and([finding_predicate, prompt_when])
//   }

//   let case_builder = eb.case().when(
//     buildSignPredicate(first_sign),
//   )
//     .then(jsonBuildObject({
//       name: literalString(first_sign.priority),
//       warning_sign: literalString(first_sign.key),
//     }))

//   for (const sign of rest) {
//     case_builder = case_builder
//       .when(
//         buildSignPredicate(sign),
//       )
//       .then(jsonBuildObject({
//         name: literalString(sign.priority),
//         warning_sign: literalString(sign.key),
//       }))
//   }

//   return case_builder.end().as('priority')
// }
