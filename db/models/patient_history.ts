import { RenderedPatientHistory, TrxOrDbOrQueryCreator } from '../../types.ts'
// import { patient_findings } from './patient_findings.ts'

// Diagnoses
// Yes self reported statuses
// Anything else that's a descendant of chronic disease
// function getPreExistingConditions(): Promise<RenderedFindingRelativeToHealthWorker[]> {

// }

export const patient_history = {
  get(
    _trx: TrxOrDbOrQueryCreator,
    {/* patient_encounter_id, patient_encounter_employee_id */}: {
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
  },
}
