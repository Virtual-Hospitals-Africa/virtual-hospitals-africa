import type { Maybe, RenderedEmployee, RenderedHealthWorker, TrxOrDb } from '../../types.ts'
import { health_workers } from './health_workers.ts'
import { base, identity } from './_base.ts'
import { Workflow } from '../../shared/workflow.ts'
import { WORKFLOW_DEPARTMENTS } from '../../shared/departments.ts'
import { exists } from '../../util/exists.ts'
import matching from '../../util/matching.ts'
import { HealthWorkerWithGoogleTokens } from './health_worker_google_tokens.ts'
import { Profession } from '../../db.d.ts'

import { concat } from '../helpers.ts'
import { HealthWorkerSearch } from './health_workers_base.ts'

export type EmployeesSearch = HealthWorkerSearch & {
  can_perform_workflow?: Workflow
  licence_number?: Maybe<string>
  licence_status?: 'all' | 'active' | 'revoked' | 'expired'
}

export type AddEmployeeOpts = {
  profession: Profession
  is_admin: boolean
  specialty?: string
  organization_id: string
  health_worker_attrs: Partial<HealthWorkerWithGoogleTokens>
}

function fromHealthWorker(
  health_worker: RenderedHealthWorker,
  organization_id: string | undefined,
): RenderedEmployee {
  const organization_employment = organization_id
    ? exists(health_worker.organizations.find(matching({
      id: organization_id,
    })))
    : health_worker.organizations[0]
  return {
    ...health_worker,
    organization_id: organization_employment.id,
    employee_id: organization_employment.employment_id,
    profession: organization_employment.role,
    is_admin: organization_employment.is_admin,
    specialty: organization_employment.specialty,
    href: `/app/organizations/${organization_employment.id}/employees/${health_worker.id}`,
    licence: null,
  }
}

export function interpretLicenceSearchAsSuch({ search, ...opts }: EmployeesSearch): EmployeesSearch {
  // If it's got a number, we're seaching for a licence, not a name
  const is_licence_like = !!search && /\d/.test(search.toUpperCase())
  return is_licence_like ? { ...opts, search: null, licence_number: search } : { ...opts, search }
}

export const employees = base({
  top_level_table: 'employment',
  baseQuery(trx: TrxOrDb, query: EmployeesSearch) {
    const opts = interpretLicenceSearchAsSuch(query)
    let qb = health_workers.baseQuery(trx, opts)
      .innerJoin('employment', 'employment.health_worker_id', 'health_workers.id')
      .select((eb) => [
        'employment.id as employee_id',
        'employment.organization_id',
        'employment.role',
        'employment.is_admin',
        concat('/app/organizations/', eb.ref('employment.organization_id'), '/employees/', eb.ref('employment.health_worker_id')).as('href'),
      ])

    if (opts.can_perform_workflow) {
      const department = WORKFLOW_DEPARTMENTS[opts.can_perform_workflow]

      qb = qb.innerJoin(
        'department_employment',
        'department_employment.employment_id',
        'employment.id',
      )
        .innerJoin(
          'organization_departments',
          'organization_departments.id',
          'department_employment.department_id',
        )
        .where('organization_departments.name', '=', department)
    }

    return qb
  },
  formatResult: identity<RenderedEmployee>,
  fromHealthWorker,
})
