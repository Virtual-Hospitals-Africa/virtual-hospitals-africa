import { SnomedWarningSignSearchResult, TrxOrDbOrQueryCreator } from '../../types.ts'
import { base } from './_base.ts'
import { AgeDetermination, SnomedCategory } from '../../db.d.ts'
import { asConceptSExpression } from '../../shared/snomed_concepts.ts'
import { snomed_concept_finding_like } from './snomed_concept_finding_like.ts'

type SearchTerms = {
  search: string
  age_determination: AgeDetermination
  pregnancy?: boolean
  categories?: SnomedCategory[]
}

export const snomed_warning_signs = base({
  verbose: true,
  top_level_table: 'snomed_concept_finding_like',
  baseQuery(trx: TrxOrDbOrQueryCreator, { age_determination, pregnancy, ...terms }: SearchTerms) {
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
      .selectAll('results')
      .select([
        'snomed_concept_prioritizations.priority',
        'snomed_concept_prioritizations.warning_sign as priority_by_virtue_of_matching_warning_sign',
      ])
  },
  formatResult({ id: snomed_concept_id, ...result }): SnomedWarningSignSearchResult {
    const concept_s_expression = asConceptSExpression(result)
    const clinical_finding_s_expression = `(clinical_finding ${concept_s_expression})`
    return {
      ...result,
      clinical_finding_s_expression,
      snomed_concept_id,
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
