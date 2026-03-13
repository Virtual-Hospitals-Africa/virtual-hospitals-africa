import { TrxOrDb } from '../../types.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { system_priority_evaluation } from '../../shared/s_expression_schemas.ts'
import { SYSTEM_PRIORITY_EVALUATIONS_LISP } from '../../s_expression/system_priority_evaluations.ts'
import { patient_triage } from './patient_triage.ts'
import { ruleRunner, type RuleRunnerInput } from './system_rules.ts'
import { ORDERED_PRIORITIES } from '../../shared/priorities.ts'
import { pMap } from '../../util/inParallel.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'

export const SYSTEM_PRIORITY_EVALUATIONS_PARSED = SYSTEM_PRIORITY_EVALUATIONS_LISP.map((d) => parseWithSchema(d, system_priority_evaluation))

const findMatchingRecords = ruleRunner(SYSTEM_PRIORITY_EVALUATIONS_PARSED)

export const system_priority_evaluations = {
  async insertSystemPriorityEvaluationsIfNotAlreadyIdentified(
    trx: TrxOrDb,
    input: RuleRunnerInput,
  ) {
    if (!input.patient_age_determination) return 'Skipped: patient age determination is unknown'
    const new_priority_evaluations = await findMatchingRecords(trx, input)

    if (!new_priority_evaluations.matching_rules.length) {
      return new_priority_evaluations.message
    }

    const rule_has_higher_priority_than_some_existing_record = new_priority_evaluations.matching_rules.filter(({ rule, contributing_records }) =>
      contributing_records.some(
        ({ priority }) => !priority || ORDERED_PRIORITIES.indexOf(priority) < ORDERED_PRIORITIES.indexOf(rule.priority),
      )
    )

    if (!rule_has_higher_priority_than_some_existing_record.length) {
      return `system_priority_evaluation rule matched, but all records already have that priority level or higher ${
        inverseSExpression(rule_has_higher_priority_than_some_existing_record[0].rule)
      }`
    }

    console.time(`${input.listener_name} ${input.listener_id} insert_levels`)
    const inserted = await pMap(
      rule_has_higher_priority_than_some_existing_record,
      ({ rule: { priority }, contributing_records }) =>
        patient_triage.insertLevel(trx, {
          patient_id: input.patient_id,
          patient_encounter_id: input.patient_encounter_id,
          by_system: true,
          triage_level: priority,
          evaluates_record_ids: contributing_records.map(({ record_id }) => record_id),
        }),
    )
    console.timeEnd(`${input.listener_name} ${input.listener_id} insert_levels`)

    return `Inserted ${inserted.length} priority evaluation(s)`
  },
}
