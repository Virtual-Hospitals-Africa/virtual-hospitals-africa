import { sql } from 'kysely'
import { RenderedEmployeeWithPresence, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'
import { employees, EmployeesSearch } from './employees.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { TEST_ORGANIZATION_UUIDS } from 'test/_helpers/organizations.ts'

export const employees_presence = base({
  top_level_table: 'employment',
  baseQuery(trx: TrxOrDbOrQueryCreator, opts: EmployeesSearch) {
    return employees.baseQuery(trx, opts)
      .leftJoin('employment_presence', 'employment_presence.id', 'employment.id')
      .select((eb) => [
        eb.fn.coalesce('employment_presence.at_work', sql.lit(false)).as('at_work'),
        'employment_presence.with_patient_id',
      ])
  },
  formatResult: identity,
  getForClinicAssumingTestHospital(
    trx: TrxOrDb,
    { organization_id, health_worker_id }: { organization_id: string; health_worker_id: string },
  ): Promise<{
    facility_employees: RenderedEmployeeWithPresence[]
    hospital_employees: RenderedEmployeeWithPresence[]
  }> {
    // TODO get this for real
    const nearest_hospital_id = TEST_ORGANIZATION_UUIDS.ZA.hospital

    return promiseProps({
      facility_employees: employees_presence.findAll(trx, {
        organization_id,
        excluding_health_worker_id: health_worker_id,
      }),
      hospital_employees: employees_presence.findAll(trx, {
        organization_id: nearest_hospital_id,
        excluding_health_worker_id: health_worker_id,
      }),
    })
  },
})
