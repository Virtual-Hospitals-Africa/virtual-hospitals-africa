import { assert } from 'std/assert/assert.ts'
import { HealthWorkerOrganization, RenderedPatientEncounter, TrxOrDbOrQueryCreator } from '../../types.ts'
import { employees } from './employees.ts'
import { base, identity } from './_base.ts'

export const patient_encounter_employees = base({
  top_level_table: 'patient_encounter_employees' as const,
  baseQuery(trx: TrxOrDbOrQueryCreator, _terms: Record<string, never>) {
    return employees.baseQuery(trx, {})
      .innerJoin(
        'patient_encounter_employees',
        'employment.id',
        'patient_encounter_employees.employment_id',
      )
      .select([
        'patient_encounter_employees.id as patient_encounter_employee_id',
        'patient_encounter_employees.seen_at',
      ])
  },
  formatResult: identity,
  seenPatientEncounterEmployeeId(
    encounter: RenderedPatientEncounter,
    organization_employment: HealthWorkerOrganization,
  ) {
    const employee = encounter.all_employees_seen.find((employee) => employee.employee_id === organization_employment.employment_id)
    assert(
      employee,
      'If the encounter exists and the health worker is manipulating it, the health worker must have seen the patient at least once',
    )
    return employee.patient_encounter_employee_id
  },
})
