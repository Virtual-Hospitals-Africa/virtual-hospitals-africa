import { sql } from 'kysely'
import { EmployedHealthWorker, RenderedEmployee, TrxOrDb } from '../../types.ts'
import { health_workers, type HealthWorkerSearch } from './health_workers.ts'
import { base } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { assertArrayNonEmpty } from '../../util/arraySize.ts'
import isString from '../../util/isString.ts'
import { Workflow } from '../../shared/workflow.ts'
import { WORKFLOW_DEPARTMENTS } from '../../shared/departments.ts'
import { exists } from '../../util/exists.ts'
import matching from '../../util/matching.ts'

function baseQuery(trx: TrxOrDb) {
  return health_workers.baseQuery(trx)
    .innerJoin('employment', 'employment.health_worker_id', 'health_workers.id')
    .select([
      'employment.id as employee_id',
      'employment.organization_id',
      'employment.profession',
      'employment.specialty',
      'employment.is_admin',
      sql<string>`
        '/app/organizations/' || employment.organization_id::text || '/employees/' || employment.health_worker_id::text
      `.as('href'),
    ])
}

function fromHealthWorker(
  health_worker: EmployedHealthWorker,
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
    profession: organization_employment.profession,
    is_admin: organization_employment.is_admin,
    specialty: organization_employment.specialty,
    href:
      `/app/organizations/${organization_employment.id}/employees/${health_worker.id}`,
  }
}

export const employees = base({
  top_level_table: 'employment',
  baseQuery,
  formatResult: (
    { organizations, ...employee },
  ): RenderedEmployee => {
    assertArrayNonEmpty(organizations)
    return {
      ...employee,
      organizations,
    }
  },
  handleSearch(
    qb,
    opts: HealthWorkerSearch & {
      // TODO
      include_incomplete_registration?: boolean
      can_perform_workflow?: Workflow
    },
  ) {
    if (opts.search) {
      qb = qb.where('health_workers.name', 'ilike', `%${opts.search}%`)
    }

    if (opts.professions) {
      assertOr400(opts.professions.length > 0, 'professions must not be empty')
      qb = qb.where(
        'employment.profession',
        'in',
        opts.professions,
      )
    }

    if (opts.organization_id) {
      qb = qb.where(
        'employment.organization_id',
        'in',
        isString(opts.organization_id)
          ? [opts.organization_id]
          : opts.organization_id,
      )
    }

    if (opts.prioritize_organization_id) {
      qb = qb.orderBy(
        (eb) =>
          eb(
            'employment.organization_id',
            '=',
            opts.prioritize_organization_id!,
          ),
        'desc',
      )
    }
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
  fromHealthWorker,
})
