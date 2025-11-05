import * as cheerio from 'cheerio'
import { HealthWorkerWithGoogleTokens, Names, TrxOrDb } from '../../types.ts'
import * as sessions from '../../db/models/sessions.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as employment from '../../db/models/employment.ts'
import * as organizations from '../../db/models/organizations.ts'
import * as nurse_registration_details from '../../db/models/nurse_registration_details.ts'
import * as health_worker_organization_calenders from '../../db/models/health_worker_organization_calenders.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { organizationDepartmentIdsOfProfession } from '../../shared/departments.ts'
import testCalendars from '../../mocks/testCalendars.ts'
import { insertHealthWorker, testHealthWorker } from './health_workers.ts'
import { route } from '../route.ts'
import { testNurseRegistrationDetails } from '../../mocks/testRegistrationDetails.ts'
import omit from '../../util/omit.ts'

type TestHealthWorkerOpts = {
  profession?:
    | 'doctor'
    | 'admin'
    | 'nurse'
    | 'receptionist'
    | 'none'
  specialty?: string
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
  avatar_url: string
  phone_number?: import('../../types.ts').Maybe<string>
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

  const created_employee = await employment.addOne(trx, {
    organization_id,
    profession,
    department_ids,
    health_worker_id: health_worker.id,
  })
  const employee_id = created_employee.id
  const calendars = testCalendars()
  await health_worker_organization_calenders.add(
    trx,
    health_worker.id,
    [{
      organization_id,
      ...calendars,
      availability_set: true,
    }],
  )

  if (profession === 'nurse' && registration_status !== 'not started') {
    const admin = await health_workers.upsertWithGoogleCredentials(
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
      profession: 'admin',
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

  const fetchWithSession: typeof fetch = (
    input: URL | RequestInfo,
    { headers, ...rest }: RequestInit = {},
  ) =>
    fetch(
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

  const fetchOk = async (url: string | URL, init?: RequestInit) => {
    const response = await fetchWithSession(url, init)
    if (!response.ok) {
      const method = init?.method || 'GET'
      console.error(`${method} ${url}`)
      if (init?.body) {
        console.error(init.body)
      }
      throw new Error(`[${response.status}]: ${await response.text()}`)
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
