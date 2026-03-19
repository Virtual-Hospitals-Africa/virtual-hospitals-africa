import { assert } from 'std/assert/assert.ts'
import { buildExpression } from './s_expression.ts'
import { AgeDetermination, Priority, TrxOrDb } from '../../types.ts'
import { debugLog, literalString, temporaryTable } from '../helpers.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { Lang, MeasurementComparison, QueryableNode } from '../../shared/s_expression_schemas.ts'
import compactMap from '../../util/compactMap.ts'
import uniq from '../../util/uniq.ts'
import { isPriority } from '../../shared/priorities.ts'

type Evidence = Lang['finding' | 'evaluation' | 'diagnosis'] | MeasurementComparison
type Record = { id: string; existence: 'Yes' | 'No' | 'Unknown' }

export function* allEvidenceToLookFor(node: QueryableNode): Generator<Evidence> {
  switch (node.atom) {
    case 'finding':
    case 'evaluation':
    case 'diagnosis':
      yield node
      break
    case '<':
    case '<=':
    case '=':
    case '>':
    case '>=':
      if (node.type === 'measurement') {
        yield node
      }
      break
    case 'or':
    case 'and':
    case 'any2':
      for (const expression of node.expressions) {
        yield* allEvidenceToLookFor(expression)
      }
      break
    default:
      throw new Error(`Not supported ${node.atom}`)
  }
}

function isPositive(record: Record): record is Record & { existence: 'Yes' } {
  return record.existence === 'Yes'
}

export type RuleRunnerInput = {
  listener_id: string
  listener_name: string
  patient_id: string
  patient_encounter_id: string
  patient_age_determination: AgeDetermination | null
  records: {
    id: string
    existence: 'Yes' | 'No' | 'Unknown'
  }[]
}

export function ruleRunner<
  Rule extends {
    ages: AgeDetermination[]
    due_to: QueryableNode
  },
>(
  rules: Rule[],
  toConsiderFilter?: (
    trx: TrxOrDb,
    patient_identifiers: { patient_id: string; patient_encounter_id: string },
    rules: Rule[],
    positive_records: {
      id: string
      existence: 'Yes'
    }[],
  ) => Promise<Rule[]>,
) {
  const rules_by_age = {
    'adult': rules.filter((rule) => rule.ages.includes('adult')),
    'older child': rules.filter((rule) => rule.ages.includes('older child')),
    'younger child': rules.filter((rule) => rule.ages.includes('younger child')),
  }

  const record_nodes_to_s_expressions = new Map<Evidence, string>()
  const record_s_expressions_to_nodes = new Map<string, Evidence>()
  const rules_to_record_s_expressions = new Map<Rule, Set<string>>()
  for (const rule of rules) {
    const record_s_expressions = new Set<string>()
    rules_to_record_s_expressions.set(rule, record_s_expressions)
    for (const finding of allEvidenceToLookFor(rule.due_to)) {
      const finding_s_expr = inverseSExpression(finding)
      record_nodes_to_s_expressions.set(finding, finding_s_expr)
      record_s_expressions_to_nodes.set(finding_s_expr, finding)
      record_s_expressions.add(finding_s_expr)
    }
  }

  return async function findMatchingRecords(
    trx: TrxOrDb,
    input: RuleRunnerInput,
  ): Promise<{
    message: string
    matching_rules: {
      rule: Rule
      contributing_records: {
        record_id: string
        priority: Priority | null
      }[]
    }[]
    other_rules_evaluated: Rule[]
  }> {
    function noMatchingRules(message: string, other_rules_evaluated: Rule[]) {
      return { message, other_rules_evaluated, matching_rules: [] }
    }

    const { listener_id, listener_name, patient_id, patient_encounter_id, patient_age_determination, /*procedure_id, */ records } = input
    console.log(listener_name, listener_id, 'in processor')
    if (!patient_age_determination) return noMatchingRules('No patient age determination', [])

    const rules_of_age = rules_by_age[patient_age_determination]

    if (!rules_of_age.length) return noMatchingRules(`No rules for age ${patient_age_determination}`, [])
    const positive_records = records.filter(isPositive)

    assert(record_s_expressions_to_nodes.size)

    console.time(`${listener_name} ${listener_id} toConsiderFilter`)
    const rules_to_consider = toConsiderFilter ? await toConsiderFilter(trx, input, rules_of_age, positive_records) : rules_of_age

    console.timeEnd(`${listener_name} ${listener_id} toConsiderFilter`)

    if (!rules_to_consider.length) return noMatchingRules('No rules to consider after filter', rules_of_age)

    if (!positive_records.length) {
      return {
        message: 'vacuous success',
        matching_rules: [],
        other_rules_evaluated: rules_of_age,
      }
    }

    const new_records_applicable_query = trx
      .with('positive_records', () => temporaryTable(trx, positive_records))
      .with('all_records', (qb) => {
        const record_s_expressions_to_consider = uniq(rules_to_consider.flatMap(
          (rule) => Array.from(rules_to_record_s_expressions.get(rule)!),
        ))

        const [first, ...others] = record_s_expressions_to_consider.map((record_s_expression) =>
          qb.selectFrom(
            buildExpression(
              trx,
              { patient_id, patient_encounter_id },
              record_s_expressions_to_nodes.get(record_s_expression)!,
            ).where(
              'patient_records_aggregated.id',
              'in',
              qb.selectFrom('positive_records').select('id'),
            ).as('sub'),
          ).select([
            literalString(record_s_expression).as('record_s_expression'),
            'sub.id as record_id',
          ])
        )
        return others.reduce(
          (acc, curr) => acc.unionAll(curr),
          first,
        )
      })
      .selectFrom('all_records')
      .selectAll()

    console.time(`${listener_name} ${listener_id} new_records_applicable`)
    const new_records_applicable = await new_records_applicable_query.execute()
    console.timeEnd(`${listener_name} ${listener_id} new_records_applicable`)

    if (!new_records_applicable.length) return noMatchingRules('No rules to consider after filter', rules_to_consider)

    const rules_for_which_new_records_applicable = rules_to_consider.filter((rule) => {
      const record_s_expressions = rules_to_record_s_expressions.get(rule)!
      return new_records_applicable.some(({ record_s_expression }) => record_s_expressions.has(record_s_expression))
    })

    assert(
      rules_for_which_new_records_applicable.length,
      'If there are new records applicable and we already filtered to only a given set of rules - these records should have matched some rules',
    )

    // Second round: For rules where new findings are applicable, check ALL patient records
    // (not just the newly created findings) to see if evidence is satisfied
    const all_record_s_expressions_for_applicable_rules = new Map<string, Evidence>()

    for (const rule of rules_for_which_new_records_applicable) {
      const record_s_expressions = rules_to_record_s_expressions.get(rule)
      assert(record_s_expressions)
      for (const finding_s_expr of record_s_expressions) {
        const node = record_s_expressions_to_nodes.get(finding_s_expr)
        assert(node)
        all_record_s_expressions_for_applicable_rules.set(finding_s_expr, node)
      }
    }

    assert(all_record_s_expressions_for_applicable_rules.size)

    const [first_all_records_rule, ...other_all_records_rules] = all_record_s_expressions_for_applicable_rules.entries().map(
      ([record_s_expression, node]) =>
        trx.selectFrom(
          buildExpression(
            trx,
            { patient_id, patient_encounter_id },
            node,
          ).as('sub'),
        ).select([
          literalString(record_s_expression).as('record_s_expression'),
          'sub.id as record_id',
        ]),
    )

    const all_records_for_rules_query = trx
      .with('all_records_for_rules', () =>
        other_all_records_rules.reduce(
          (acc, curr) => acc.unionAll(curr),
          first_all_records_rule,
        ))
      .selectFrom('all_records_for_rules')
      .selectAll('all_records_for_rules')
      .select((eb) => [
        eb.selectFrom('patient_triage_level')
          .innerJoin(
            'patient_records as triage_patient_records',
            'patient_triage_level.id',
            'triage_patient_records.id',
          )
          .innerJoin('patient_records_still_valid as triage_valid', 'triage_valid.id', 'triage_patient_records.id')
          .innerJoin(
            'patient_record_relations as triage_relations',
            'triage_relations.source_id',
            'patient_triage_level.id',
          )
          .innerJoin(
            'snomed_inferred_canonical_name_and_category as triage_snomed_inferred_canonical_name_and_category',
            'triage_patient_records.value_snomed_concept_id',
            'triage_snomed_inferred_canonical_name_and_category.id',
          )
          .whereRef(
            'triage_relations.destination_id',
            '=',
            'all_records_for_rules.record_id',
          )
          .select('triage_snomed_inferred_canonical_name_and_category.name')
          .orderBy('triage_patient_records.created_at', 'desc')
          .limit(1)
          .as('priority'),
      ])

    console.time(`${listener_name} ${listener_id} all_records_for_rules`)
    console.log('xxxmmmmmmmm')
    debugLog(all_records_for_rules_query)
    const all_records_for_rules = await all_records_for_rules_query.execute()
    console.timeEnd(`${listener_name} ${listener_id} all_records_for_rules`)

    // Create a map for quick lookup of findings by their s-expression
    const findings_map = new Map<string, { record_id: string; priority: Priority | null }[]>()
    for (const { record_s_expression, record_id, priority } of all_records_for_rules) {
      const existing = findings_map.get(record_s_expression)
      assert(priority === null || isPriority(priority))
      const record = { record_id, priority }
      if (existing) {
        existing.push(record)
      } else {
        findings_map.set(record_s_expression, [record])
      }
    }

    const matching_rules = compactMap(rules_for_which_new_records_applicable, (rule) => {
      const result = evaluateEvidence(rule.due_to)
      if (result.satisfies) return { rule, contributing_records: Array.from(result.contributing_records) }
    })

    const matching_rules_set = new Set(matching_rules.map((r) => r.rule))
    const other_rules_evaluated = rules_for_which_new_records_applicable.filter((rule) => !matching_rules_set.has(rule))

    return {
      message: 'success',
      matching_rules,
      other_rules_evaluated,
    }

    type Result =
      | { satisfies: true; contributing_records: { record_id: string; priority: Priority | null }[] }
      | { satisfies: false }

    function evaluateEvidence(evidence: QueryableNode): Result {
      const contributing_records: { record_id: string; priority: Priority | null }[] = []
      switch (evidence.atom) {
        case 'or': {
          let any_true = false

          for (const expr of evidence.expressions) {
            const evaluation = evaluateEvidence(expr)
            if (evaluation.satisfies) {
              any_true = true
              for (const record of evaluation.contributing_records) {
                contributing_records.push(record)
              }
            }
          }

          if (any_true) {
            return { satisfies: true, contributing_records }
          }
          return { satisfies: false }
        }

        case 'and': {
          for (const expr of evidence.expressions) {
            const evaluation = evaluateEvidence(expr)
            if (!evaluation.satisfies) {
              return { satisfies: false }
            }
            for (const record of evaluation.contributing_records) {
              contributing_records.push(record)
            }
          }

          return { satisfies: true, contributing_records }
        }

        case 'any2': {
          let true_count = 0

          for (const expr of evidence.expressions) {
            const evaluation = evaluateEvidence(expr)
            if (evaluation.satisfies) {
              true_count++
              for (const record of evaluation.contributing_records) {
                contributing_records.push(record)
              }
            }
          }

          if (true_count >= 2) {
            return { satisfies: true, contributing_records }
          }
          return { satisfies: false }
        }

        case 'finding':
        case 'evaluation':
        case 'diagnosis':
          return evaluateSingle(evidence)
        case '<':
        case '<=':
        case '=':
        case '>':
        case '>=': {
          if (evidence.type === 'measurement') {
            return evaluateSingle(evidence)
          }
          console.log('TODO handle time_ago')
          return { satisfies: false }
        }
        default:
          throw new Error(`Not supported ${evidence.atom}`)
      }
    }

    function evaluateSingle(evidence: Evidence): Result {
      const finding_s_expr = record_nodes_to_s_expressions.get(evidence)
      assert(finding_s_expr)
      const matching_records = findings_map.get(finding_s_expr)

      if (matching_records && matching_records.length > 0) {
        return { satisfies: true, contributing_records: matching_records }
      }
      return { satisfies: false }
    }
  }
}
