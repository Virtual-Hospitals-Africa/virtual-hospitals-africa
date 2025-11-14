import * as cheerio from 'cheerio'
import { Maybe, Names, TrxOrDb } from '../../types.ts'
import * as sessions from '../../db/models/sessions.ts'
import * as employment from '../../db/models/employment.ts'
import * as organizations from '../../db/models/organizations.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import * as employment_calendars from '../../db/models/employment_calendars.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { organizationDepartmentIdsOfProfession } from '../../shared/departments.ts'
import testCalendars from '../../mocks/testCalendars.ts'
import { insertHealthWorker, testHealthWorker } from './health_workers.ts'
import { route } from '../route.ts'
import { testNurseRegistrationDetails } from '../../mocks/testRegistrationDetails.ts'
import omit from '../../util/omit.ts'
import {
  HealthWorkerWithGoogleTokens,
  upsertWithGoogleCredentials,
} from '../../db/models/health_worker_google_tokens.ts'
import { assert } from 'std/assert/assert.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'

type TestHealthWorkerOpts = {
  profession?:
    | 'doctor'
    | 'admin'
    | 'nurse'
    | 'receptionist'
    | 'none'
  specialty?: string
  is_admin?: boolean
  registration_status?: 'approved' | 'awaiting approval' | 'not started'
  organization_id?: string
  health_worker_attrs?: Partial<HealthWorkerWithGoogleTokens>
}

type TestEmployee = Names & {
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
  {
    profession = 'nurse',
    organization_id = '00000000-0000-0000-0000-000000000001',
    health_worker_attrs = {},
    registration_status = 'approved',
    specialty,
    is_admin,
  }: TestHealthWorkerOpts = {},
): Promise<TestEmployee> {
  if (!specialty && ['nurse', 'doctor'].includes(profession)) {
    specialty = 'primary care'
  }
  if (profession !== 'nurse') {
    assertEquals(
      registration_status,
      'approved',
      'No logic yet to handle registration for non-nurses',
    )
  }

  const health_worker: HealthWorkerWithGoogleTokens = await insertHealthWorker(
    trx,
    health_worker_attrs,
  )
  if (profession === 'none') {
    assert(!is_admin)
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

  const organization = await organizations.getById(trx, organization_id)
  const department_ids = organizationDepartmentIdsOfProfession(
    organization,
    profession,
    specialty,
  )
  if (is_admin) {
    assertNotEquals(profession, 'admin')
    const admin_department_ids = organizationDepartmentIdsOfProfession(
      organization,
      'admin',
    )
    department_ids.push(...admin_department_ids)
  }

  const created_employee = await employment.addOne(trx, {
    organization_id,
    profession: profession === 'admin' ? null : profession,
    is_admin: profession === 'admin' || !!is_admin,
    department_ids,
    health_worker_id: health_worker.id,
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

  if (profession === 'nurse' && registration_status !== 'not started') {
    const admin = await upsertWithGoogleCredentials(
      trx,
      testHealthWorker(),
    )
    const admin_department_ids = organizationDepartmentIdsOfProfession(
      organization,
      'admin',
    )
    const details = await testNurseRegistrationDetails(trx, {
      health_worker_id: health_worker.id,
    })

    await nurse_registration_details.add(
      trx,
      omit(details, [
        'name',
        'first_names',
        'surname',
        'preferred_name',
      ]),
    )
    await employment.addOne(trx, {
      organization_id,
      health_worker_id: admin.id,
      profession: null,
      is_admin: true,
      department_ids: admin_department_ids,
    })

    if (registration_status === 'approved') {
      await nurse_registration_details.approve(trx, {
        approved_by: admin.id,
        health_worker_id: health_worker.id,
      })
    }
  }

  return { ...health_worker, organization_id, employee_id, calendars }
}

export async function addTestEmployeeWithSession(
  trx: TrxOrDb,
  opts?: TestHealthWorkerOpts,
) {
  const health_worker = await addTestEmployee(trx, opts)
  const session = await sessions.create(trx, 'health_worker', {
    entity_id: health_worker.id,
  })

  function fetchWithSession(
    input: URL | RequestInfo,
    { headers, ...rest }: RequestInit = {},
  ): ReturnType<typeof fetch> {
    return fetch(
      typeof input === 'string' && input.startsWith('/')
        ? `${route}${input}`
        : input,
      {
        headers: {
          ...headers,
          Cookie: `session_id=${session.id}`,
        },
        ...rest,
      },
    )
  }

  const fetchOk = async (
    url: string | URL,
    init?: RequestInit,
    opts?: { cancel_response_body?: boolean },
  ) => {
    const response = await fetchWithSession(url, init)
    if (!response.ok) {
      const method = init?.method || 'GET'
      console.error(`${method} ${url}`)
      if (init?.body) {
        console.error(init.body)
      }
      throw new Error(`[${response.status}]: ${await response.text()}`)
    }
    if (opts?.cancel_response_body) {
      await response.body?.cancel()
    }
    return response
  }

  const fetchCheerio = async (url: string | URL, init?: RequestInit) => {
    const response = await fetchOk(url, init)
    const html = await response.text()
    const $ = cheerio.load(html, {
      baseURI: response.url,
    })
    return Object.assign($, {
      url: response.url,
    })
  }

  return {
    session_id: session.id,
    health_worker,
    fetch: fetchWithSession,
    fetchOk,
    fetchCheerio,
  }
}
