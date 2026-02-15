import type { EmployedHealthWorker, Maybe, RenderedEmployee, TrxOrDb } from '../../types.ts'
import { health_workers, type HealthWorkerSearch } from './health_workers.ts'
import { base, identity } from './_base.ts'
import { Workflow } from '../../shared/workflow.ts'
import { WORKFLOW_DEPARTMENTS } from '../../shared/departments.ts'
import { exists } from '../../util/exists.ts'
import matching from '../../util/matching.ts'
import { HealthWorkerWithGoogleTokens } from './health_worker_google_tokens.ts'
import { Profession } from '../../db.d.ts'
import { health_worker_licences } from './health_worker_licences.ts'
import { concat, jsonObjectFrom } from '../helpers.ts'

export type EmployeesSearch = HealthWorkerSearch & {
  can_perform_workflow?: Workflow
  licence_number?: Maybe<string>
  licence_status: 'all' | 'active' | 'revoked' | 'expired'
}

export type AddEmployeeOpts = {
  profession: Profession
  is_admin: boolean
  specialty?: string
  organization_id: string
  health_worker_attrs: Partial<HealthWorkerWithGoogleTokens>
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
    href: `/app/organizations/${organization_employment.id}/employees/${health_worker.id}`,
    licence: null
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
      .select(eb => [
        'employment.id as employee_id',
        'employment.organization_id',
        'employment.profession',
        'employment.specialty',
        'employment.is_admin',
        concat('/app/organizations/', eb.ref('employment.organization_id'), '/employees/', eb.ref('employment.health_worker_id')).as('href'),
        jsonObjectFrom(
          health_worker_licences.baseQuery(trx, {
            status: opts.licence_status,
          })
            .where('health_worker_id', '=', eb.ref('health_workers.id'))
            .where('profession', '=', eb.ref('employment.profession'))
            .where('country', '=', eb.selectFrom('organizations').select('country').where('organizations.id', '=', eb.ref('employment.organization_id')))
        ).as('licence'),
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
  // async add(
  //     trx: TrxOrDb,
  //     {
  //       profession,
  //       organization_id,
  //       health_worker_attrs,
  //       registration_status = 'approved',
  //       specialty,
  //       is_admin,
  //     }: TestHealthWorkerOpts = {},
  //   ): Promise<TestEmployee> {
  //     if (!specialty && ['nurse', 'doctor'].includes(profession)) {
  //       specialty = 'Primary care'
  //     }
  //     if (profession !== 'nurse') {
  //       assertEquals(
  //         registration_status,
  //         'approved',
  //         'No logic yet to handle registration for non-nurses',
  //       )
  //     }
    
  //     const health_worker: HealthWorkerWithGoogleTokens = await insertHealthWorker(
  //       trx,
  //       {
  //         ...health_worker_attrs,
  //         ...asMaybeNames(health_worker_attrs),
  //       },
  //     )
    
  //     const organization = await organizations_with_departments.getById(trx, organization_id)
  //     const department_ids = organizationDepartmentIdsOfProfession(
  //       organization,
  //       profession,
  //       specialty,
  //     )
  //     if (is_admin) {
  //       assertNotEquals(profession, 'admin')
  //       const admin_department_ids = organizationDepartmentIdsOfProfession(
  //         organization,
  //         'admin',
  //       )
  //       department_ids.push(...admin_department_ids)
  //     }
    
  //     const created_employee = await employment.addOne(trx, {
  //       organization_id,
  //       profession: profession === 'admin' ? null : profession,
  //       is_admin: profession === 'admin' || !!is_admin,
  //       department_ids,
  //       health_worker_id: health_worker.id,
  //       specialty,
  //     })
  //     const employee_id = created_employee.id
  //     const calendars = testCalendars()
  //     await employment_calendars.add(
  //       trx,
  //       [{
  //         ...calendars,
  //         employment_id: employee_id,
  //         availability_set: true,
  //       }],
  //     )
    
  //     if (profession === 'nurse' && registration_status !== 'not started') {
  //       const admin = await health_worker_google_tokens.insertWithGoogleCredentials(
  //         trx,
  //         testHealthWorker(),
  //       )
  //       const admin_department_ids = organizationDepartmentIdsOfProfession(
  //         organization,
  //         'admin',
  //       )
  //       const details = await testNurseRegistrationDetails(trx, {
  //         health_worker_id: health_worker.id,
  //       })
    
  //       await nurse_registration_details.add(
  //         trx,
  //         omit(details, [
  //           'name',
  //           'first_names',
  //           'surname',
  //           'preferred_name',
  //         ]),
  //       )
  //       await employment.addOne(trx, {
  //         organization_id,
  //         health_worker_id: admin.id,
  //         profession: null,
  //         is_admin: true,
  //         department_ids: admin_department_ids,
  //       })
    
  //       if (registration_status === 'approved') {
  //         await nurse_registration_details.approve(trx, {
  //           approved_by: admin.id,
  //           health_worker_id: health_worker.id,
  //         })
  //       }
  //     }
    
  //     assert(health_worker.first_names)
  //     assert(health_worker.name)
  //     assert(health_worker.surname)
  //     assert(health_worker.preferred_name)
  //     return {
  //       ...health_worker,
  //       organization_id,
  //       employee_id,
  //       calendars,
  //       ...asNames(health_worker),
  //     }
  //   }
    
})
