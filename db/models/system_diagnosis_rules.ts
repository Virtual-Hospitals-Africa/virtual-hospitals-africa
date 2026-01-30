import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import { patient_evaluations, type PatientEvaluationsSearch } from './patient_evaluations.ts'
import { buildExpression } from './s_expression.ts'
import { AgeDetermination, TrxOrDb } from '../../types.ts'
import { arrayAggIds, debugLog, literalString } from '../helpers.ts'
import { DIAGNOSIS } from '../../shared/snomed_concepts.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { Comparisons, Lang, system_diagnosis_rule } from '../../shared/s_expression_schemas.ts'
import { SYSTEM_DIAGNOSIS_RULES } from '../../s_expression/system_diagnosis_rules.ts'

export const SYSTEM_DIAGNOSIS_RULES_PARSED = SYSTEM_DIAGNOSIS_RULES.map(d => parseWithSchema(d, system_diagnosis_rule))

export function baseQuery(trx: TrxOrDb, opts: PatientEvaluationsSearch) {
  return patient_evaluations.baseQuery(trx, opts)
    .where('patient_records_aggregated.root_snomed_concept_id', '=', DIAGNOSIS.id)
}

export const system_diagnosis_rules = {
  async insertSystemDiagnosesIfNotAlreadyIdentified(
    trx: TrxOrDb,
    { patient_id, patient_encounter_id, patient_age_determination, /*procedure_id, */ findings }: {
      patient_id: string
      patient_encounter_id: string
      // procedure_id: string
      patient_age_determination: AgeDetermination | null,
      findings: {
        id: string
        existence: 'Yes' | 'No'
      }[]
    },
  ) {
    if (!patient_age_determination) return

    // TODO, maybe handle negative findings? There could be diagnoses that call for them
    const positive_finding_ids = findings
      .filter((f) => f.existence === 'Yes')
      .map((f) => f.id)
    
    if (!positive_finding_ids.length) return

    const to_consider = SYSTEM_DIAGNOSIS_RULES_PARSED.filter((rule) => rule.ages.includes(patient_age_determination))

    if (!to_consider.length) return

    to_consider.forEach(rule => {
      assert(rule.diagnosis.certainty_qualifier === 'probable', 'Only supporting probable rules for the first pass')
    })

    const finding_s_expressions_to_finding_nodes = new Map<string, Lang['finding' | Comparisons]>()
    const findings_s_expressions_to_rules = new Map<string, Set<Lang['system_diagnosis_rule']>>()
    const rules_to_finding_nodes = new Map<Lang['system_diagnosis_rule'], Array<Lang['finding' | Comparisons]>>()
    for (const rule of to_consider) {
      const finding_nodes: Array<Lang['finding' | Comparisons]> = []
      rules_to_finding_nodes.set(rule, finding_nodes)
      for (const finding of allFindingsToLookFor(rule.evidence)) {
        finding_nodes.push(finding)
        const finding_s_expr = inverseSExpression(finding)
        finding_s_expressions_to_finding_nodes.set(finding_s_expr, finding)
        if (!findings_s_expressions_to_rules.has(finding_s_expr)) {
          findings_s_expressions_to_rules.set(finding_s_expr, new Set())
        }
        findings_s_expressions_to_rules.get(finding_s_expr)!.add(rule)
      }
    }

    function * allFindingsToLookFor(node: Lang['or' | 'and' | 'any2' | 'finding' | Comparisons]): Generator<Lang['finding' | Comparisons]> {
      switch (node.atom) {
        case 'finding':
        case '<':
        case '<=':
        case '=':
        case '>':
        case '>=':
          yield node
          break
        case 'or':
        case 'and':
        case 'any2':
          for (const expression of node.expressions) {
            yield * allFindingsToLookFor(expression)
          }
          break
      }
    }

    assert(finding_s_expressions_to_finding_nodes.size)

    const [first_diagnosis, ...other_diagnoses] = finding_s_expressions_to_finding_nodes.entries().map(
      ([s_expr, node]) =>
        trx.selectNoFrom([
          literalString(s_expr).as('s_expr'),
          arrayAggIds(
            buildExpression(
              trx,
              { patient_id, patient_encounter_id },
              node,
            ).where(
              'patient_records.id',
              'in',
              positive_finding_ids,
            ),
          ).as('matching_finding_ids'),
        ]),
    )

    const new_findings_applicable_query = trx
      .with('all_findings', () => other_diagnoses.reduce(
        (acc, curr) => acc.unionAll(curr),
        first_diagnosis,
      ))
      .selectFrom('all_findings')
      .selectAll()
      .where(sql`cardinality(matching_finding_ids)`, '>', 0)

    // If this diagnosis was already made, do nothing
    // Make a list of all the findings by recursively crawling all evidence fields
    // First see if the positive finding could possibly contribute as evidence
    // Only for those where it could do you need to look further


    // If a diagnosis of this level or 


    debugLog(new_findings_applicable_query)

    const new_findings_applicable = await new_findings_applicable_query.execute()

    return { new_findings_applicable, finding_s_expressions_to_finding_nodes, findings_s_expressions_to_rules, rules_to_finding_nodes}

    // await pMap(diagnosis_results, async ([diagnosis_result, diagnosis]) => {
    //   assertEquals(diagnosis_result.description, diagnosis.description)

    //   if (arrayIsEmpty(diagnosis_result.matching_finding_ids)) {
    //     return null
    //   }
    //   // TODO: the procedure was already identified, so probably nothing to do here
    //   // Technically we could add the finding as Due to
    //   if (diagnosis_result.procedure_id) {
    //     return null
    //   }

    //   const procedure = await patient_procedures
    //     .insertOneNested(
    //       trx,
    //       {
    //         patient_id,
    //         patient_encounter_id,
    //         by_system: true,
    //         procedure: diagnosis.procedure,
    //       },
    //     )

    //   assert(procedure.inserted_new)

    //   const evaluation_id = generateUUID()
    //   const relations = diagnosis_result.matching_finding_ids.map((finding_id) => ({
    //     id: generateUUID(),
    //     source_id: evaluation_id,
    //     destination_id: finding_id,
    //   }))

    //   await patient_evaluations.insertOneNestedQuery(
    //     trx,
    //     {
    //       evaluation_id,
    //       patient_id,
    //       patient_encounter_id,
    //       by_system: true,
    //       evaluates_record_id: procedure.procedure_id,
    //       evaluation: `(evaluation ${EVALUATION_ACTION.s_expression} ${ACTION_STATUS.s_expression} ${TO_BE_DONE.s_expression})`,
    //     },
    //   ).with(
    //     'inserting_relation_patient_records',
    //     (qb) =>
    //       qb.insertInto('patient_records').values(relations.map(({ id }) => ({
    //         id,
    //         patient_id,
    //         patient_encounter_id,
    //         root_snomed_concept_id: RELATIONSHIP.id,
    //         specific_snomed_concept_id: DUE_TO.id,
    //       }))),
    //   ).with(
    //     'inserting_relations',
    //     (qb) => qb.insertInto('patient_record_relations').values(relations),
    //   ).selectNoFrom([
    //     success_true,
    //   ]).executeTakeFirstOrThrow()
    // })
  },
}
