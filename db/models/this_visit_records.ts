// deno-lint-ignore-file no-unused-vars
import { ThisVisitRecords, TrxOrDb } from '../../types.ts'

export function get(
  trx: TrxOrDb,
  { patient_encounter_id, patient_encounter_employee_id }: {
    patient_encounter_id: string
    patient_encounter_employee_id: string
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
