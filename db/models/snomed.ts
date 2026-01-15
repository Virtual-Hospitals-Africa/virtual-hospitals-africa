import { ExpressionBuilder, sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { base, SearchResult } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { DB, SnomedCategory } from '../../db.d.ts'
import { findingQueryExpression, WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { buildExpressionPredicate } from './s_expression_snomed_concepts.ts'
import { jsonBuildObject, literalString } from '../helpers.ts'
import { buildExpression } from './s_expression.ts'
import { isAtom, parseExpression } from '../../shared/s_expression.ts'
import { asConceptSExpression } from '../../shared/snomed_concepts.ts'

type SearchTerms = {
  search: string
  patient_id?: string
  categories?: SnomedCategory[]
}

function getPriorityOfSnomedConcept<
  // deno-lint-ignore no-explicit-any
  EB extends ExpressionBuilder<DB, any>,
>(
  eb: EB,
  column_ref: Parameters<EB['ref']>[0],
  patient_id: string,
  trx: TrxOrDb,
) {
  const [first_sign, ...rest] = WARNING_SIGNS

  // Build the predicate for a warning sign, including prompt_when check if present
  const buildSignPredicate = (sign: typeof first_sign) => {
    const finding_predicate = buildExpressionPredicate(
      eb,
      column_ref,
      findingQueryExpression(sign),
    )

    if (!sign.prompt_when_s_expression) {
      return finding_predicate
    }

    // TODO: probably move this idea into db/models/s_expression.ts
    // Build the prompt_when check for the patient
    // Handle 'not' expressions specially: use NOT EXISTS instead of EXISTS on the negated query
    const parsed = parseExpression(sign.prompt_when_s_expression)

    const prompt_when = isAtom(parsed, 'not')
      ? eb.not(eb.exists(buildExpression(
        trx,
        { patient_id },
        parsed.expression,
      )))
      : eb.exists(
        buildExpression(
          trx,
          { patient_id },
          parsed,
        ),
      )

    return eb.and([finding_predicate, prompt_when])
  }

  let case_builder = eb.case().when(
    buildSignPredicate(first_sign),
  )
    .then(jsonBuildObject({
      name: literalString(first_sign.sats_priority),
      warning_sign: literalString(first_sign.key),
    }))

  for (const sign of rest) {
    case_builder = case_builder
      .when(
        buildSignPredicate(sign),
      )
      .then(jsonBuildObject({
        name: literalString(sign.sats_priority),
        warning_sign: literalString(sign.key),
      }))
  }

  return case_builder.end().as('priority')
}

function baseQuery(trx: TrxOrDb, terms: SearchTerms) {
  assertOr400(terms.search, 'Must be searching for a term')

  // 1. & 2. Use DISTINCT ON and Early Filtering
  const best_descriptions = trx
    .selectFrom('snomed_description')
    // Join with the category table EARLY so we only rank relevant concepts
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_description.concept_id'
    )
    .where(sql<boolean>`term % ${terms.search}`)
    .$if(!!terms.categories, (qb) =>
      qb.where('snomed_inferred_canonical_name_and_category.category', 'in', terms.categories!)
    )
    // DISTINCT ON (concept_id) picks the best term for each concept in one pass
    .select([
      'snomed_description.concept_id',
      sql<number>`similarity(term, ${terms.search})`.as('similarity'),
    ])
    // Standard PG requirement: DISTINCT ON expression must match the first ORDER BY
    .distinctOn('snomed_description.concept_id')
    .orderBy('snomed_description.concept_id')
    .orderBy(sql`similarity(term, ${terms.search})`, 'desc')
    .limit(100)
    .as('best_descriptions')

  // 3. Final selection using the optimized set
  return trx.selectFrom('snomed_inferred_canonical_name_and_category as icnc')
    .innerJoin(
      best_descriptions,
      'best_descriptions.concept_id',
      'icnc.id',
    )
    .selectAll('icnc')
    .select('best_descriptions.similarity as best_similarity')
    .select((eb) =>
      terms.patient_id
        ? getPriorityOfSnomedConcept(
          eb,
          'icnc.id',
          terms.patient_id,
          trx,
        )
        : sql<null>`null`.as('priority')
    )
    // Sort the final 100 results by relevance
    .orderBy('best_descriptions.similarity', 'desc')
}

export const snomed_model = base({
  top_level_table: 'snomed_inferred_canonical_name_and_category',
  baseQuery,
  getPriorityOfSnomedConcept,
  formatResult(result) {
    const concept_s_expression = asConceptSExpression(result)
    const clinical_finding_s_expression = `(clinical_finding ${concept_s_expression})`
    return {
      clinical_finding_s_expression,
      snomed_concept_id: result.id,
      primary_name: result.name,
      secondary_text: result.category,
      sats_priority: result.priority?.name,
      sats_priority_by_virtue_of_matching_warning_sign: result.priority
        ?.warning_sign,
      similarity: result.best_similarity,
      category: 'Search Results' as const,
    }
  },
})

export type SnomedConceptSearchResult = SearchResult<typeof snomed_model>

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
