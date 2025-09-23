// deno-lint-ignore-file no-unused-vars
import { RenderedPatientHistory, TrxOrDb } from '../../types.ts'

export function get(
  trx: TrxOrDb,
  { patient_encounter_id, patient_encounter_employee_id }: {
    patient_encounter_id: string
    patient_encounter_employee_id: string
  },
): Promise<RenderedPatientHistory> {
  return Promise.resolve({
    pre_existing_conditions: [],
    allergies: [],
    family_history: [],
    major_surgeries: [],
    medications: [],
    lifestyle: [],
  })
}
