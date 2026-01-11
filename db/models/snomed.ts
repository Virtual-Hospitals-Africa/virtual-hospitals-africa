import { ExpressionBuilder, sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { base, SearchResult } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { DB, SnomedCategory } from '../../db.d.ts'
import {
  findingQueryExpression,
  KEYED_WARNING_SIGNS,
} from '../../shared/warning_signs.ts'
import { buildExpressionPredicate } from './s_expression_snomed_concepts.ts'
import { jsonBuildObject, literalString } from '../helpers.ts'
import { buildExpression } from './s_expression.ts'
import { isAtom, parseExpression } from '../../shared/s_expression.ts'
import {
  asConceptSExpression,
  CLINICAL_FINDING,
} from '../../shared/snomed_concepts.ts'

type SearchTerms = {
  search: string
  patient_id: string
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
  const [first_sign, ...rest] = KEYED_WARNING_SIGNS

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
  assertOr400(
    terms.patient_id,
    'Must be searching with respect to a particular patient (in order to ascertain the priority level)',
  )

  const descriptions_with_similarity = trx
    .selectFrom('snomed_description')
    .innerJoin(
      'snomed_concept',
      'snomed_concept.id',
      'snomed_description.concept_id',
    )
    .where('snomed_concept.active', '=', true)
    // Maybe if they're searching by an outdated term we still want to return it?
    // .where('snomed_description.active', '=', true)
    // Use trigram similarity operator for fuzzy matching
    .where(sql<boolean>`term % ${terms.search}`)
    .select([
      'snomed_description.concept_id',
      sql<number>`similarity(term, ${terms.search})`.as('similarity'),
    ])
    .orderBy(sql<number>`similarity(term, ${terms.search})`, 'desc')
    .limit(100)
    .as('descriptions_with_similarity')

  const snomed_concepts = trx.selectFrom(
    descriptions_with_similarity,
  )
    .select([
      'descriptions_with_similarity.concept_id',
      sql<number>`max(descriptions_with_similarity.similarity)`.as(
        'best_similarity',
      ),
    ])
    .groupBy('descriptions_with_similarity.concept_id')
    .as('snomed_concepts')

  return trx.selectFrom('snomed_inferred_canonical_name_and_category')
    .innerJoin(
      snomed_concepts,
      'snomed_concepts.concept_id',
      'snomed_inferred_canonical_name_and_category.id',
    )
    .selectAll('snomed_inferred_canonical_name_and_category')
    .$if(
      !!terms.categories,
      (qb) =>
        qb.where(
          'snomed_inferred_canonical_name_and_category.category',
          'in',
          terms.categories!,
        ),
    )
    .select('snomed_concepts.best_similarity')
    .select((eb) =>
      getPriorityOfSnomedConcept(
        eb,
        'snomed_inferred_canonical_name_and_category.id',
        terms.patient_id,
        trx,
      )
    )
    .orderBy('snomed_concepts.best_similarity', 'desc')
}

export const snomed_model = base({
  verbose: true,
  top_level_table: 'snomed_inferred_canonical_name_and_category',
  baseQuery,
  getPriorityOfSnomedConcept,
  formatResult(result) {
    const concept_s_expression = asConceptSExpression(result)
    const clinical_finding_s_expression =
      `(finding ${CLINICAL_FINDING.s_expression} ${concept_s_expression})`
    return {
      clinical_finding_s_expression,
      snomed_concept_id: result.id,
      sats_primary_name: result.name,
      sats_secondary_text: result.category,
      sats_priority: result.priority?.name || ('Non-urgent' as const),
      sats_priority_by_virtue_of_matching_warning_sign: result.priority
        ?.warning_sign,
      similarity: result.best_similarity,
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
