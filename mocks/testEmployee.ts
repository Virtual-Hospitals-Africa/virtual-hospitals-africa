import { assert } from 'std/assert/assert.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { employment } from '../db/models/employment.ts'
import { employment_calendars } from '../db/models/employment_calendars.ts'
import { HealthWorkerWithGoogleTokens } from '../db/models/health_worker_google_tokens.ts'
import { organizations_with_departments } from '../db/models/organizations_with_departments.ts'
import { organizationDepartmentIdsOfProfession } from '../shared/departments.ts'
import { insertHealthWorker, testHealthWorker } from 'test/_helpers/health_workers.ts'
import { Maybe, Names, TrxOrDb } from '../types.ts'
import { asMaybeNames, asNames } from '../util/asNames.ts'
import testCalendars from './testCalendars.ts'
import { health_worker_licences } from '../db/models/health_worker_licences.ts'

export type TestHealthWorkerOpts =
  | {
    role: 'none'
    country?: string
    health_worker_attrs?: Partial<HealthWorkerWithGoogleTokens>
  }
  | {
    role?: 'doctor' | 'admin' | 'nurse' | 'receptionist'
    specialty?: string
    is_admin?: boolean
    organization_id: string
    seniority_order?: number
    country?: string
    health_worker_attrs?: Partial<HealthWorkerWithGoogleTokens>
  }

export type TestEmployee = Names & {
  organization_id: string
  employee_id: string
  calendars: {
    gcal_appointments_calendar_id: string
    gcal_availability_calendar_id: string
  }
  email: string
  phone_number?: Maybe<string>
  access_token: string
  refresh_token: string
  expires_at: Date | string
  id: string
}

export async function addTestEmployee(
  trx: TrxOrDb,
  opts: TestHealthWorkerOpts,
): Promise<TestEmployee> {
  const { country = 'ZA', health_worker_attrs = {} } = opts

  const health_worker: HealthWorkerWithGoogleTokens = await insertHealthWorker(
    trx,
    {
      ...testHealthWorker(),
      ...health_worker_attrs,
      ...asMaybeNames(health_worker_attrs),
    },
  )
  if (opts.role === 'none') {
    return {
      ...health_worker,
      get organization_id() {
        throw new Error(
          'Not actually an employee. Therefore, does not have organization_id',
        )
      },
      get employee_id() {
        throw new Error(
          'Not actually an employee. Therefore, does not have employee_id',
        )
      },
      get calendars() {
        throw new Error(
          'Not actually an employee. Therefore, does not have calendars',
        )
      },
    } as unknown as TestEmployee
  }

  const { role = 'nurse', organization_id, is_admin, seniority_order } = opts
  const specialty = opts.specialty ??
    (['nurse', 'doctor'].includes(role) ? 'Primary care' : undefined)

  const organization = await organizations_with_departments.getById(trx, organization_id)
  const department_ids = organizationDepartmentIdsOfProfession(
    organization,
    role,
    specialty,
  )
  if (is_admin) {
    assertNotEquals(role, 'admin')
    const admin_department_ids = organizationDepartmentIdsOfProfession(
      organization,
      'admin',
    )
    department_ids.push(...admin_department_ids)
  }

  const created_employee = await employment.addOne(trx, {
    organization_id,
    role,
    is_admin: role === 'admin' || !!is_admin,
    department_ids,
    health_worker_id: health_worker.id,
    seniority_order,
  })
  const employee_id = created_employee.id
  const calendars = testCalendars()
  await employment_calendars.add(
    trx,
    [{
      ...calendars,
      employment_id: employee_id,
      availability_set: true,
    }],
  )

  await health_worker_licences.insertTest(
    trx,
    {
      health_worker_id: health_worker.id,
      country,
      role,
      specialty,
    },
  )

  assert(health_worker.first_names)
  assert(health_worker.name)
  assert(health_worker.surname)
  assert(health_worker.preferred_name)
  return {
    ...health_worker,
    organization_id,
    employee_id,
    calendars,
    ...asNames(health_worker),
  }
}
