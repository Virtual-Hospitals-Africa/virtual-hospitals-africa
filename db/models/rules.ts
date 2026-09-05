import { sql } from 'kysely'
import { AgeDetermination, ApplicableRule, NewRecordsToConsiderWithSatisfyingDueToIds, RecordsSatisfyingDueToIds, TrxOrDbOrQueryCreator } from '../../types.ts'
import { asText, jsonBuildObject, literalString } from '../helpers.ts'

import { EventTimeComparison, QueryableEvidenceNode } from '../../shared/s_expression_schemas.ts'
import uniq from '../../util/uniq.ts'
import { EvidenceNode } from './s_expression_evidence.ts'
import compactMap from '../../util/compactMap.ts'
import { base, identity } from './_base.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import { assert } from 'std/assert/assert.ts'

import { activeConditionAsOr } from '../../shared/s_expression_active_condition_as_or.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { diagnosisToEvaluation } from '../../shared/diagnosis.ts'
import { getRuleByDescription } from '../../shared/rules.ts'

export const rules = base({
  top_level_table: 'rules',
  baseQuery(trx: TrxOrDbOrQueryCreator, {
    patient_id,
    patient_encounter_id,
    patient_age_determination,
    positive_records_satisfying_some_due_to,
    type,
  }: {
    patient_id: string
    patient_encounter_id: string
    patient_age_determination: AgeDetermination
    positive_records_satisfying_some_due_to: RecordsSatisfyingDueToIds
    type?: 'task' | 'system_priority_evaluation' | 'system_diagnosis_rule'
  }) {
    assert(positive_records_satisfying_some_due_to.length)

    const all_satisfying_due_to_ids = positive_records_satisfying_some_due_to
      .flatMap((r) => r.satisfying_due_to_ids)

    const matching_rules_query = trx
      .selectFrom('patient_record_satisfying_due_tos')
      .where('patient_record_satisfying_due_tos.id', 'in', all_satisfying_due_to_ids)
      .innerJoin('rule_due_to', 'rule_due_to.due_to_id', 'patient_record_satisfying_due_tos.due_to_id')
      .innerJoin('rules', 'rules.id', 'rule_due_to.rule_id')
      .where('rules.age_determinations', '@>', sql<AgeDetermination[]>`ARRAY[${patient_age_determination}]::age_determination[]`)
      .select('rules.id')
      .distinct()

    return trx.with('matching_rules', () => matching_rules_query)
      .selectFrom('matching_rules')
      .innerJoin('rules', 'matching_rules.id', 'rules.id')
      .selectAll('rules')
      .leftJoin('tasks', 'matching_rules.id', 'tasks.id')
      .leftJoin('system_priority_evaluations', 'matching_rules.id', 'system_priority_evaluations.id')
      .leftJoin('system_diagnosis_rules', 'matching_rules.id', 'system_diagnosis_rules.id')
      .leftJoin(
        'snomed_inferred_canonical_name_and_category as diagnosis_snomed_concept',
        'system_diagnosis_rules.snomed_concept_id',
        'diagnosis_snomed_concept.id',
      )
      .select((eb) => [
        jsonArrayFrom(
          eb.selectFrom('patient_record_satisfying_due_tos')
            .innerJoin('due_to', 'patient_record_satisfying_due_tos.due_to_id', 'due_to.id')
            .innerJoin('rule_due_to', 'rule_due_to.due_to_id', 'due_to.id')
            .where('rule_due_to.rule_id', '=', eb.ref('rules.id'))
            .innerJoin('patient_records_aggregated', 'patient_record_satisfying_due_tos.patient_record_id', 'patient_records_aggregated.id')
            .where('patient_records_aggregated.patient_id', '=', patient_id)
            .where((eb2) =>
              eb2.or([
                eb2('history', '=', true),
                eb2('patient_records_aggregated.patient_encounter_id', '=', patient_encounter_id),
              ])
            )
            .distinct()
            .select([
              'patient_record_id',
              's_expression',
              'always_applies_if_present',
              'history',
            ]),
        )
          .as('evidence'),
        eb.case()
          .when('tasks.id', 'is not', null)
          .then(jsonBuildObject({
            type: literalString('task' as const),
          }))
          .when('system_priority_evaluations.id', 'is not', null)
          .then(jsonBuildObject({
            type: literalString('system_priority_evaluation' as const),
            priority: eb.ref('system_priority_evaluations.priority').$notNull(),
          }))
          .when('system_diagnosis_rules.id', 'is not', null)
          .then(jsonBuildObject({
            type: literalString('system_diagnosis_rule' as const),
            snomed_concept: jsonBuildObject({
              id: asText(eb, 'system_diagnosis_rules.snomed_concept_id').$notNull(),
              name: eb.ref('diagnosis_snomed_concept.name').$notNull(),
              category: eb.ref('diagnosis_snomed_concept.category').$notNull(),
            }),
            certainty: eb.ref('system_diagnosis_rules.certainty').$notNull(),
          }))
          .end().$notNull().as('rule_effect'),
      ])
      .$if(type === 'task', (qb) => qb.where('tasks.id', 'is not', null))
      .$if(type === 'system_diagnosis_rule', (qb) => qb.where('system_diagnosis_rules.id', 'is not', null))
      .$if(type === 'system_priority_evaluation', (qb) => qb.where('system_priority_evaluations.id', 'is not', null))
  },

  formatResult: identity,

  async getApplicableBasedOnNewRecords(
    trx: TrxOrDbOrQueryCreator,
    { patient_id, patient_encounter_id, patient_age_determination, /*procedure_id, */ records }: NewRecordsToConsiderWithSatisfyingDueToIds,
    type?: 'task' | 'system_priority_evaluation' | 'system_diagnosis_rule',
  ): Promise<string | ApplicableRule[]> {
    const positive_records_satisfying_some_due_to = records
      .filter((r) => r.existence === 'Yes')
      .filter((r) => !!r.satisfying_due_to_ids.length)

    if (arrayIsEmpty(positive_records_satisfying_some_due_to)) return 'Skipped: no positive findings satisfying some due_to'

    const rules_matching_some_finding = await rules.findAll(trx, {
      patient_id,
      patient_encounter_id,
      patient_age_determination,
      positive_records_satisfying_some_due_to,
      type,
    })

    const parsed_rules = rules_matching_some_finding.map((rule) => ({
      ...rule,
      ...getRuleByDescription(rule.description),
      // TODO The uniq could be removed probably if upstream we enforce uniqueness
      matching_finding_ids: uniq(rule.evidence.map((record) => record.patient_record_id)),
      certainly_applies: rule.evidence.some((record) => record.always_applies_if_present),
    }))

    return compactMap(parsed_rules, (rule) => {
      const result = evaluateEvidence(rule.due_to, rule.evidence)
      return result.satisfies && {
        ...rule,
        matching_finding_ids: result.contributing_records,
      }
    })
  },
})

type Evidence = {
  patient_record_id: string
  always_applies_if_present: boolean
  history: boolean
  s_expression: string
}[]

type Result =
  | { satisfies: true; contributing_records: string[] }
  | { satisfies: false }

export function evaluateEvidence(due_to: QueryableEvidenceNode, evidence: Evidence): Result {
  switch (due_to.atom) {
    case 'or': {
      const contributing_records: string[] = []
      let any_true = false
      for (const expr of due_to.expressions) {
        const result = evaluateEvidence(expr, evidence)
        if (result.satisfies) {
          any_true = true
          contributing_records.push(...result.contributing_records)
        }
      }
      if (any_true) return { satisfies: true, contributing_records }
      return { satisfies: false }
    }

    case 'and': {
      const contributing_records: string[] = []
      for (const expr of due_to.expressions) {
        const result = evaluateEvidence(expr, evidence)
        if (!result.satisfies) return { satisfies: false }
        contributing_records.push(...result.contributing_records)
      }
      return { satisfies: true, contributing_records }
    }

    case 'any2': {
      const contributing_records: string[] = []
      let true_count = 0
      for (const expr of due_to.expressions) {
        const result = evaluateEvidence(expr, evidence)
        if (result.satisfies) {
          true_count++
          contributing_records.push(...result.contributing_records)
        }
      }
      if (true_count >= 2) return { satisfies: true, contributing_records }
      return { satisfies: false }
    }

    case 'finding':
    case 'evaluation':
      return evaluateSingle(due_to, evidence)

    case 'diagnosis':
      return evaluateSingle(diagnosisToEvaluation(due_to), evidence)

    case 'active_condition':
      return evaluateEvidence(activeConditionAsOr(due_to), evidence)

    case '<':
    case '<=':
    case '=':
    case '>':
    case '>=':
      // Both measurement and event_time comparisons are resolved in SQL when tagging
      // due_tos, so the evidence rows already carry the due_to's s_expression if satisfied
      return evaluateSingle(due_to, evidence)

    default:
      throw new Error(`Not supported ${(due_to as QueryableEvidenceNode).atom}`)
  }
}

export function evaluateSingle(due_to: EvidenceNode | EventTimeComparison, evidence: Evidence): Result {
  const due_to_s_expression = inverseSExpression(due_to)
  const contributing_records = evidence
    .filter((record) => record.s_expression === due_to_s_expression)
    .map((record) => record.patient_record_id)

  if (contributing_records.length) {
    return { satisfies: true, contributing_records }
  }
  return { satisfies: false }
}
