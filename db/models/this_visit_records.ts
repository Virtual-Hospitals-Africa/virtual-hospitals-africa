// deno-lint-ignore-file no-unused-vars
import { ThisVisitRecords, TrxOrDb } from '../../types.ts'

export function get(
  trx: TrxOrDb,
  { encounter_id, encounter_provider_id }: {
    encounter_id: string
    encounter_provider_id: string
  },
): Promise<ThisVisitRecords> {
  return Promise.resolve({
    chief_complaint: [],
    vitals: [],
    symptoms: [],
    history: [],
    general_assessments: [],
    examinations: [],
    diagnostic_tests: [],
    diagnoses: [],
    prescriptions: [],
    orders: [],
  })
}
