import { AgeDetermination, TrxOrDb } from '../../types.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { system_priority_evaluation } from '../../shared/s_expression_schemas.ts'
import { SYSTEM_PRIORITY_EVALUATIONS } from '../../s_expression/system_priority_evaluations.ts'
import { patient_triage } from './patient_triage.ts'
import { ruleRunner } from './system_rules.ts'
import { ORDERED_PRIORITIES } from '../../shared/priorities.ts'
import { pMap } from '../../util/inParallel.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'

export const SYSTEM_PRIORITY_EVALUATIONS_PARSED = SYSTEM_PRIORITY_EVALUATIONS.map((d) => parseWithSchema(d, system_priority_evaluation))

const findMatchingRecords = ruleRunner(SYSTEM_PRIORITY_EVALUATIONS_PARSED)

export const system_priority_evaluations = {
  async insertSystemPriorityEvaluationsIfNotAlreadyIdentified(
    trx: TrxOrDb,
    { patient_id, patient_encounter_id, patient_age_determination, /*procedure_id, */ records }: {
      patient_id: string
      patient_encounter_id: string
      // procedure_id: string
      patient_age_determination: AgeDetermination | null
      records: {
        id: string
        existence: 'Yes' | 'No' | 'Unknown'
      }[]
    },
  ) {
    if (!patient_age_determination) return 'Skipped: patient age determination is unknown'
    const new_priority_evaluations = await findMatchingRecords(trx, { patient_id, patient_encounter_id, patient_age_determination, /*procedure_id, */ records })

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

    const inserted = await pMap(
      rule_has_higher_priority_than_some_existing_record,
      ({ rule: { priority }, contributing_records }) =>
        patient_triage.insertLevel(trx, {
          patient_id,
          patient_encounter_id,
          by_system: true,
          triage_level: priority,
          evaluates_record_ids: contributing_records.map(({ record_id }) => record_id),
        }),
    )

    return `Inserted ${inserted.length} priority evaluation(s)`
  },
}
