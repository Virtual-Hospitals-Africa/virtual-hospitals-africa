import { RenderedPatientOpenEncounter } from '../types.ts'
import { arrayIsEmpty } from '../util/arraySize.ts'
import { exists } from '../util/exists.ts'
import matching from '../util/matching.ts'

export function presentWithPatient(
  { all_employees_seen, status }: RenderedPatientOpenEncounter,
) {
  const { present_with_patient_encounter_employee_ids } = status.patient_presence
  if (arrayIsEmpty(present_with_patient_encounter_employee_ids)) {
    return []
  }
  return present_with_patient_encounter_employee_ids.map(
    (patient_encounter_employee_id) =>
      exists(
        all_employees_seen.find(matching({ patient_encounter_employee_id })),
      ),
  )
}
