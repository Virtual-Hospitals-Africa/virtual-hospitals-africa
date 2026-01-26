import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { base, identity } from './_base.ts'
import { employees, EmployeesSearch } from './employees.ts'

function baseQuery(trx: TrxOrDb, opts: EmployeesSearch) {
  return employees.baseQuery(trx, opts)
    .leftJoin('employment_presence', 'employment_presence.id', 'employment.id')
    .select((eb) => [
      eb.fn.coalesce('employment_presence.at_work', sql.lit(false)).as('at_work'),
      'employment_presence.with_patient_id',
    ])
}

export const employees_presence = base({
  top_level_table: 'employment',
  baseQuery,
  formatResult: identity,
})
