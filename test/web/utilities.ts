import * as cheerio from 'cheerio'
import generateUUID from '../../util/uuid.ts'
import { it } from 'std/testing/bdd.ts'
import { redis } from '../../external-clients/redis.ts'
import db from '../../db/db.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_workers.ts'
import * as employment from '../../db/models/employment.ts'
import * as facilities from '../../db/models/facilities.ts'
import * as details from '../../db/models/nurse_registration_details.ts'
import { testHealthWorker, testRegistrationDetails } from '../mocks.ts'
import set from '../../util/set.ts'
import { parseParam } from '../../util/parseForm.ts'
import { HealthWorkerWithGoogleTokens, TrxOrDb } from '../../types.ts'
import { testCalendars } from '../mocks.ts'
import { addCalendars } from '../../db/models/providers.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'

type TestHealthWorkerOpts = {
  scenario:
    | 'base'
    | 'doctor'
    | 'admin'
    | 'nurse'
    | 'approved-nurse'
    | 'awaiting-approval-nurse'
  organization_id?: number
  health_worker_attrs?: Partial<HealthWorkerWithGoogleTokens>
}

export const route = `https://localhost:8005`

export async function addTestHealthWorker(
  trx: TrxOrDb,
  { scenario, organization_id = 1, health_worker_attrs }: TestHealthWorkerOpts = {
    scenario: 'base',
  },
) {
  const healthWorker: HealthWorkerWithGoogleTokens & {
    employee_id?: number
    calendars?: {
      gcal_appointments_calendar_id: string
      gcal_availability_calendar_id: string
    }
  } = await upsertWithGoogleCredentials(trx, {
    ...testHealthWorker(),
    ...health_worker_attrs,
  })

  switch (scenario) {
    case 'awaiting-approval-nurse': {
      const [created_employee] = await employment.add(trx, [{
        organization_id,
        health_worker_id: healthWorker.id,
        profession: 'nurse',
      }])
      healthWorker.employee_id = created_employee.id
      healthWorker.calendars = testCalendars()
      await addCalendars(trx, healthWorker.id, [{
        organization_id,
        ...healthWorker.calendars,
        availability_set: true,
      }])
      await details.add(
        trx,
        await testRegistrationDetails(trx, {
          health_worker_id: healthWorker.id,
        }),
      )
      break
    }
    case 'approved-nurse': {
      const admin = await upsertWithGoogleCredentials(trx, testHealthWorker())
      const [created_employee] = await employment.add(trx, [{
        organization_id,
        health_worker_id: healthWorker.id,
        profession: 'nurse',
      }, {
        organization_id,
        health_worker_id: admin.id,
        profession: 'admin',
      }])
      healthWorker.employee_id = created_employee.id
      healthWorker.calendars = testCalendars()
      await addCalendars(trx, healthWorker.id, [{
        organization_id,
        ...healthWorker.calendars,
        availability_set: true,
      }])
      await details.add(
        trx,
        await testRegistrationDetails(trx, {
          health_worker_id: healthWorker.id,
        }),
      )
      await details.approve(trx, {
        approverId: admin.id,
        healthWorkerId: healthWorker.id,
      })
      break
    }
    case 'admin': {
      const [created_employee] = await employment.add(trx, [{
        organization_id,
        health_worker_id: healthWorker.id,
        profession: 'admin',
      }])
      healthWorker.employee_id = created_employee.id
      healthWorker.calendars = testCalendars()
      await addCalendars(trx, healthWorker.id, [{
        organization_id,
        ...healthWorker.calendars,
        availability_set: true,
      }])
      break
    }
    case 'doctor': {
      const [created_employee] = await employment.add(trx, [{
        organization_id,
        health_worker_id: healthWorker.id,
        profession: 'doctor',
      }])
      healthWorker.employee_id = created_employee.id
      healthWorker.calendars = testCalendars()
      await addCalendars(trx, healthWorker.id, [{
        organization_id,
        ...healthWorker.calendars,
        availability_set: true,
      }])
      break
    }
    case 'nurse': {
      const [created_employee] = await employment.add(trx, [{
        organization_id,
        health_worker_id: healthWorker.id,
        profession: 'nurse',
      }])
      healthWorker.employee_id = created_employee.id
      healthWorker.calendars = testCalendars()
      await addCalendars(trx, healthWorker.id, [{
        organization_id,
        ...healthWorker.calendars,
        availability_set: true,
      }])
      break
    }
  }

  return healthWorker
}

export async function addTestHealthWorkerWithSession(
  trx: TrxOrDb,
  opts: TestHealthWorkerOpts = { scenario: 'base' },
) {
  const sessionId = generateUUID()
  const healthWorker = await addTestHealthWorker(trx, opts)
  await redis.set(
    `S_${sessionId}`,
    JSON.stringify({
      data: { health_worker_id: healthWorker.id },
      _flash: {},
    }),
  )
  const fetchWithSession: typeof fetch = (
    input: URL | RequestInfo,
    { headers, ...rest }: RequestInit = {},
  ) =>
    fetch(input, {
      headers: {
        ...headers,
        Cookie: `sessionId=${sessionId}`,
      },
      ...rest,
    })

  const fetchCheerio = async (...args: Parameters<typeof fetch>) => {
    const response = await fetchWithSession(...args)
    if (!response.ok) throw new Error(await response.text())
    const html = await response.text()
    return cheerio.load(html, {
      baseURI: response.url,
    })
  }

  return {
    sessionId,
    healthWorker,
    fetch: fetchWithSession,
    fetchCheerio,
  }
}

export function getFormValues($: cheerio.CheerioAPI): unknown {
  const formValues = {}
  $('form input,textarea').each((_i, el) => {
    if (!el.attribs.name) return
    if (el.attribs.type === 'checkbox') {
      return set(
        formValues,
        el.attribs.name,
        'checked' in el.attribs,
      )
    }
    if (el.attribs.type !== 'radio' || ('checked' in el.attribs)) {
      set(
        formValues,
        el.attribs.name,
        el.attribs.value ? parseParam(el.attribs.value) : null,
      )
    }
  })
  $('form select').each((_i, el) => {
    let value = null
    $(el).find('option[selected]').each((_i, option) => {
      value = option.attribs.value && parseParam(option.attribs.value)
    })
    if (el.attribs.name) {
      set(
        formValues,
        el.attribs.name,
        value,
      )
    }
  })
  return formValues
}

export function getFormDisplay($: cheerio.CheerioAPI): unknown {
  const formDisplay = {}
  $('form input,textarea').each((_i, el) => {
    if (el.attribs.type !== 'hidden' && el.attribs.name) {
      set(
        formDisplay,
        el.attribs.name,
        el.attribs.value ?? null,
      )
    }
  })
  $('form select').each((_i, el) => {
    $(el).find('option[selected]').each((_i, option) => {
      if (el.attribs.name) {
        set(
          formDisplay,
          el.attribs.name,
          $(option).text(),
        )
      }
    })
  })
  return formDisplay
}

const withTrx = (callback: (trx: TrxOrDb) => Promise<void>) =>
  db.transaction().setIsolationLevel('read committed').execute(callback)

export function itUsesTrxAnd(
  description: string,
  callback?: (trx: TrxOrDb) => Promise<void>,
  opts: { only?: boolean; skip?: boolean } = {},
) {
  const { only, skip } = opts
  const _it = only ? it.only : skip ? it.skip : it
  _it(
    description,
    () => callback && withTrx(callback),
  )
}

itUsesTrxAnd.only = (
  description: string,
  callback: (trx: TrxOrDb) => Promise<void>,
) => itUsesTrxAnd(description, callback, { only: true })

itUsesTrxAnd.skip = (
  description: string,
  callback?: (trx: TrxOrDb) => Promise<void>,
) => itUsesTrxAnd(description, callback, { skip: true })

itUsesTrxAnd.rejects = (
  description: string,
  callback: (trx: TrxOrDb) => Promise<void>,
  validateError?: (
    error: Error & {
      cause?: {
        fields?: {
          severity: string
          code: string
          message: string
          detail: string
          schema: string
          table: string
          constraint: string
          file: string
          line: string
          routine: string
        }
      }
    },
  ) => void,
) =>
  it('rejects when ' + description, async () => {
    const error = await assertRejects(() => withTrx(callback))
    // deno-lint-ignore no-explicit-any
    validateError?.(error as any)
  })

export function withTestFacility(
  trx: TrxOrDb,
  opts: (organization_id: number) => Promise<void>,
  callback?: undefined,
): Promise<void>

export function withTestFacility(
  trx: TrxOrDb,
  opts: { kind: 'virtual' },
  callback: (organization_id: number) => Promise<void>,
): Promise<void>

export async function withTestFacility(
  trx: TrxOrDb,
  opts: { kind: 'virtual' } | ((organization_id: number) => Promise<void>),
  callback?: (organization_id: number) => Promise<void>,
) {
  let kind: 'virtual' | 'physical' = 'physical'
  if (typeof opts === 'function') {
    callback = opts
  } else {
    kind = opts.kind
  }
  const organization = await facilities.add(trx, {
    name: kind === 'physical' ? 'Test Clinic' : 'Test Virtual Hospital',
    category: kind === 'physical' ? 'Clinic' : 'Virtual Hospital',
    address: kind === 'physical' ? '123 Test St' : null,
    latitude: kind === 'physical' ? 0 : undefined,
    longitude: kind === 'physical' ? 0 : undefined,
    phone: null,
  })
  await callback!(organization.id)
  await trx.deleteFrom('organizations')
    .where('id', '=', organization.id)
    .execute()
}
