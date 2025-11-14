import { assert } from 'std/assert/assert.ts'
import {
  HealthWorkerOrganization,
  RenderedPatientEncounter,
  TrxOrDb,
} from '../../types.ts'
import * as employees from './employees.ts'

export function seenPatientEncounterEmployeeId(
  encounter: RenderedPatientEncounter,
  organization_employment: HealthWorkerOrganization,
) {
  const employee = encounter.all_employees_seen.find((employee) =>
    employee.employee_id === organization_employment.employment_id
  )
  assert(
    employee,
    'If the encounter exists and the health worker is manipulating it, the health worker must have seen the patient at least once',
  )
  return employee.patient_encounter_employee_id
}

export function baseQuery(trx: TrxOrDb) {
  return employees.baseQuery(trx)
    .innerJoin(
      'patient_encounter_employees',
      'employment.id',
      'patient_encounter_employees.employment_id',
    )
    .select([
      'patient_encounter_employees.id as patient_encounter_employee_id',
      'patient_encounter_employees.seen_at',
    ])
}
