import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { SnomedCategory } from '../../db.d.ts'
import {
  findingQueryExpression,
  KEYED_WARNING_SIGNS,
} from '../../shared/warning_signs.ts'
import { buildExpressionPredicate } from './s_expression_snomed_concepts.ts'
import { jsonBuildObject, literalString } from '../helpers.ts'
import { buildExpression } from './s_expression.ts'
import { isAtom, parseExpression } from '../../shared/s_expression.ts'

type SearchTerms = {
  search: string
  patient_id: string
  categories?: SnomedCategory[]
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

  // Use the patient_id to get the prompt_when
  //

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
    .select((eb) => {
      const [first_sign, ...rest] = KEYED_WARNING_SIGNS

      // Build the predicate for a warning sign, including prompt_when check if present
      const buildSignPredicate = (sign: typeof first_sign) => {
        const finding_predicate = buildExpressionPredicate(
          eb,
          'snomed_inferred_canonical_name_and_category.id',
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
            { patient_id: terms.patient_id },
            parsed.expression,
          )))
          : eb.exists(
            buildExpression(
              trx,
              { patient_id: terms.patient_id },
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

      return [case_builder.end().as('priority')]
    })
    .orderBy('snomed_concepts.best_similarity', 'desc')
}

export const snomed_model = base({
  verbose: true,
  top_level_table: 'snomed_inferred_canonical_name_and_category',
  baseQuery,
  formatResult(result) {
    return result
  },
})
