import { sql } from 'kysely'
import { SnomedConceptSearchResult, TrxOrDbOrQueryCreator } from '../../types.ts'
import { base } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { AgeDetermination, SnomedCategory } from '../../db.d.ts'
import { jsonBuildNullableObject } from '../helpers.ts'
import { asConceptSExpression } from '../../shared/snomed_concepts.ts'

type SearchTerms = {
  search: string
  patient_case?: {
    age_determination: AgeDetermination
    pregnancy: boolean
  }
  categories?: SnomedCategory[]
}

function baseQuery(trx: TrxOrDbOrQueryCreator, terms: SearchTerms) {
  assertOr400(terms.search, 'Must be searching for a term')

  const best_similarity = sql<number>`max(similarity(term, ${terms.search}))`

  return trx
    .selectFrom('snomed_inferred_canonical_name_and_category')
    .innerJoin(
      'snomed_description',
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_description.concept_id',
    )
    .leftJoin(
      'snomed_inferred_canonical_name_and_category as preferred_category_of_same_name',
      (join) =>
        terms.categories
          ? join.on((eb) =>
            eb.or(
              terms.categories!.slice(1).flatMap((category, i) => {
                const higher_ranking_categories = terms.categories!.slice(0, i + 1)
                return higher_ranking_categories.map((higher_ranking_category) =>
                  eb.and([
                    eb('preferred_category_of_same_name.name', '=', eb.ref('snomed_inferred_canonical_name_and_category.name')),
                    eb('snomed_inferred_canonical_name_and_category.category', '=', category),
                    eb('preferred_category_of_same_name.category', '=', higher_ranking_category),
                  ])
                )
              }),
            )
          )
          : join.on(sql<boolean>`false`),
    )
    .leftJoin('snomed_concept_prioritizations', (join) =>
      terms.patient_case
        ? join
          .onRef('snomed_concept_prioritizations.id', '=', 'snomed_inferred_canonical_name_and_category.id')
          .on('snomed_concept_prioritizations.age_determination', '=', terms.patient_case.age_determination)
          .on('snomed_concept_prioritizations.pregnancy', '=', terms.patient_case.pregnancy)
        : join.on(sql<boolean>`false`)
    )
    .where('preferred_category_of_same_name.id', 'is', null)
    .where(sql<boolean>`term % ${terms.search}`)
    .$if(!!terms.categories, (qb) => qb.where('snomed_inferred_canonical_name_and_category.category', 'in', terms.categories!))
    .select((eb) => [
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_inferred_canonical_name_and_category.name',
      'snomed_inferred_canonical_name_and_category.category',
      // Priority can technically only be determined relative to a patient because the same condition might be more or less concerning depending on their case
      jsonBuildNullableObject(eb.ref('snomed_concept_prioritizations.id'), {
        name: eb.ref('snomed_concept_prioritizations.priority'),
        warning_sign: eb.ref('snomed_concept_prioritizations.warning_sign'),
      }).as('priority'),
      best_similarity.as('best_similarity'),
    ])
    .groupBy('snomed_inferred_canonical_name_and_category.id')
    .orderBy(best_similarity, 'desc')
}

export const snomed_model = base({
  top_level_table: 'snomed_inferred_canonical_name_and_category',
  baseQuery,
  formatResult(result): SnomedConceptSearchResult {
    const concept_s_expression = asConceptSExpression(result)
    const clinical_finding_s_expression = `(clinical_finding ${concept_s_expression})`
    return {
      clinical_finding_s_expression,
      snomed_concept_id: result.id,
      name: result.name,
      description: result.category,
      priority: result.priority?.name,
      priority_by_virtue_of_matching_warning_sign: result.priority?.warning_sign ?? undefined,
      similarity: result.best_similarity,
      category: 'Search Results' as const,
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

