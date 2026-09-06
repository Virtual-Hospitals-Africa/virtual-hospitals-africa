import { sql } from 'kysely'
import {
  AgeDetermination,
  ApplicableRule,
  ApplicableRuleEffect,
  NewRecordsToConsiderWithSatisfyingDueToIds,
  RecordsSatisfyingDueToIds,
  TrxOrDbOrQueryCreator,
} from '../../types.ts'
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
import type { HypotheticalDueToMatch } from './due_to.ts'

type RuleType = 'task' | 'system_priority_evaluation' | 'system_diagnosis_rule'

// Stands in for the id of a record that has not been inserted when evaluating rules for it
export const HYPOTHETICAL_RECORD_ID = 'hypothetical'

type RuleSearchTerms =
  & {
    patient_id: string
    patient_encounter_id: string
    patient_age_determination: AgeDetermination
    type?: RuleType
  }
  & (
    // Rules linked to due_tos that inserted records have been tagged as satisfying
    | { satisfying_due_to_ids: string[]; due_to_ids?: never }
    // Rules linked to these due_tos directly, for a record that has not been inserted
    | { due_to_ids: string[]; satisfying_due_to_ids?: never }
  )

export const rules = base({
  top_level_table: 'rules',
  baseQuery(trx: TrxOrDbOrQueryCreator, {
    patient_id,
    patient_encounter_id,
    patient_age_determination,
    satisfying_due_to_ids,
    due_to_ids,
    type,
  }: RuleSearchTerms) {
    const age_filter = sql<AgeDetermination[]>`ARRAY[${patient_age_determination}]::age_determination[]`

    const matching_rules_query = satisfying_due_to_ids
      ? (assert(satisfying_due_to_ids.length),
        trx
          .selectFrom('patient_record_satisfying_due_tos')
          .where('patient_record_satisfying_due_tos.id', 'in', satisfying_due_to_ids)
          .innerJoin('rule_due_to', 'rule_due_to.due_to_id', 'patient_record_satisfying_due_tos.due_to_id')
          .innerJoin('rules', 'rules.id', 'rule_due_to.rule_id')
          .where('rules.age_determinations', '@>', age_filter)
          .select('rules.id')
          .distinct())
      : (assert(due_to_ids.length),
        trx
          .selectFrom('rule_due_to')
          .where('rule_due_to.due_to_id', 'in', due_to_ids)
          .innerJoin('rules', 'rules.id', 'rule_due_to.rule_id')
          .where('rules.age_determinations', '@>', age_filter)
          .select('rules.id')
          .distinct())

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
    type?: RuleType,
  ): Promise<string | ApplicableRule[]> {
    const positive_records_satisfying_some_due_to: RecordsSatisfyingDueToIds = records
      .filter((r) => r.existence === 'Yes')
      .filter((r) => !!r.satisfying_due_to_ids.length)

    if (arrayIsEmpty(positive_records_satisfying_some_due_to)) return 'Skipped: no positive findings satisfying some due_to'

    const rules_matching_some_finding = await rules.findAll(trx, {
      patient_id,
      patient_encounter_id,
      patient_age_determination,
      satisfying_due_to_ids: positive_records_satisfying_some_due_to.flatMap((r) => r.satisfying_due_to_ids),
      type,
    })

    return applicableRules(rules_matching_some_finding)
  },

  /*
    Which rules would apply if a record satisfying `matched_due_tos` were inserted now.
    The patient's real evidence is read from patient_record_satisfying_due_tos as usual;
    the hypothetical record's evidence is added in memory under HYPOTHETICAL_RECORD_ID,
    so and/any2 rules combine it with what is already recorded. Nothing is written.
  */
  async getApplicableForHypotheticalRecord(
    trx: TrxOrDbOrQueryCreator,
    { patient_id, patient_encounter_id, patient_age_determination, matched_due_tos, type }: {
      patient_id: string
      patient_encounter_id: string
      patient_age_determination: AgeDetermination
      matched_due_tos: HypotheticalDueToMatch[]
      type?: RuleType
    },
  ): Promise<ApplicableRule[]> {
    if (arrayIsEmpty(matched_due_tos)) return []

    const matched_by_due_to_id = new Map(matched_due_tos.map((match) => [match.due_to_id, match]))

    const rules_matching = await rules.findAll(trx, {
      patient_id,
      patient_encounter_id,
      patient_age_determination,
      due_to_ids: [...matched_by_due_to_id.keys()],
      type,
    })
    if (arrayIsEmpty(rules_matching)) return []

    const rule_due_tos = await trx.selectFrom('rule_due_to')
      .where('rule_due_to.rule_id', 'in', rules_matching.map((rule) => rule.id))
      .where('rule_due_to.due_to_id', 'in', [...matched_by_due_to_id.keys()])
      .select(['rule_due_to.rule_id', 'rule_due_to.due_to_id', 'rule_due_to.always_applies_if_present'])
      .execute()

    return applicableRules(rules_matching.map((rule) => ({
      ...rule,
      evidence: [
        ...rule.evidence,
        ...compactMap(rule_due_tos, ({ rule_id, due_to_id, always_applies_if_present }) => {
          if (rule_id !== rule.id) return
          const matched = matched_by_due_to_id.get(due_to_id)
          assert(matched)
          return {
            patient_record_id: HYPOTHETICAL_RECORD_ID,
            s_expression: matched.s_expression,
            history: matched.history,
            always_applies_if_present,
          }
        }),
      ],
    })))
  },
})

type Evidence = {
  patient_record_id: string
  always_applies_if_present: boolean
  history: boolean
  s_expression: string
}[]

function applicableRules<
  Rule extends { id: string; description: string; evidence: Evidence; rule_effect: ApplicableRuleEffect },
>(
  rules_with_evidence: Rule[],
): ApplicableRule[] {
  const parsed_rules = rules_with_evidence.map((rule) => ({
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
}

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
