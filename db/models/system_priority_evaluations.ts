import { AgeDetermination, TrxOrDb } from '../../types.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { system_priority_evaluation } from '../../shared/s_expression_schemas.ts'
import { SYSTEM_PRIORITY_EVALUATIONS } from '../../s_expression/system_priority_evaluations.ts'
import { patient_triage } from './patient_triage.ts'
import { ruleRunner } from './system_rules.ts'
import { TARGET_TIME_TO_TREATMENT_MINUTES } from '../../shared/priorities.ts'

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
    if (!patient_age_determination) return
    const new_priority_evaluations = await findMatchingRecords(trx, { patient_id, patient_encounter_id, patient_age_determination, /*procedure_id, */ records })

    for (const { rule, contributing_records } of new_priority_evaluations.matching_rules) {
      if (
        contributing_records.every(
          ({ priority }) => priority !== null && TARGET_TIME_TO_TREATMENT_MINUTES[priority] <= TARGET_TIME_TO_TREATMENT_MINUTES[rule.priority],
        )
      ) continue

      await patient_triage.insertLevel(trx, {
        patient_id,
        patient_encounter_id,
        by_system: true,
        triage_level: rule.priority,
        evaluates_record_ids: contributing_records.map(({ record_id }) => record_id),
      })
    }
  },
}
