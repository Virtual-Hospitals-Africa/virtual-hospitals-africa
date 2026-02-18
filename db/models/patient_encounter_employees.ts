import { assert } from 'std/assert/assert.ts'
import { HealthWorkerOrganization, IdSelectable, RenderedPatientEncounter, RenderedPatientEncounterEmployee, TrxOrDbOrQueryCreator } from '../../types.ts'
import { employees } from './employees.ts'
import { base, identity } from './_base.ts'
import { idSelection } from '../helpers.ts'

export const patient_encounter_employees = base({
  top_level_table: 'patient_encounter_employees' as const,
  baseQuery(trx: TrxOrDbOrQueryCreator, terms: {
    patient_encounter_id?: IdSelectable
  }) {
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
      .$if(!!terms.patient_encounter_id, (qb) =>
        qb.where(
          'patient_encounter_employees.patient_encounter_id',
          ...idSelection(terms.patient_encounter_id!),
        ))
  },
  formatResult: identity<RenderedPatientEncounterEmployee>,
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
