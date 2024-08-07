import { beforeAll } from 'std/testing/bdd.ts'
import * as cheerio from 'cheerio'
import { it } from 'std/testing/bdd.ts'
import * as sessions from '../../db/models/sessions.ts'
import db from '../../db/db.ts'
import { upsertWithGoogleCredentials } from '../../db/models/health_workers.ts'
import * as employment from '../../db/models/employment.ts'
import * as regulators from '../../db/models/regulators.ts'
import * as organizations from '../../db/models/organizations.ts'
import * as details from '../../db/models/nurse_registration_details.ts'
import * as pharmacists from '../../db/models/pharmacists.ts'
import { testHealthWorker, testRegistrationDetails } from '../mocks.ts'
import set from '../../util/set.ts'
import { parseParam } from '../../util/parseForm.ts'
import {
  HealthWorkerWithGoogleTokens,
  RenderedPharmacist,
  TrxOrDb,
} from '../../types.ts'
import { testCalendars, testPharmacist, testRegulator } from '../mocks.ts'
import { addCalendars } from '../../db/models/providers.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import { assert } from 'std/assert/assert.ts'
import range from '../../util/range.ts'
import { collect } from '../../util/inParallel.ts'
import { parseTsv } from '../../util/parseCsv.ts'
import { take } from '../../util/take.ts'

type TestHealthWorkerOpts = {
  scenario:
    | 'base'
    | 'doctor'
    | 'admin'
    | 'nurse'
    | 'approved-nurse'
    | 'awaiting-approval-nurse'
  organization_id?: string
  health_worker_attrs?: Partial<HealthWorkerWithGoogleTokens>
}

export const route = `https://localhost:8005`

export async function addTestHealthWorker(
  trx: TrxOrDb,
  {
    scenario,
    organization_id = '00000000-0000-0000-0000-000000000001',
    health_worker_attrs,
  }: TestHealthWorkerOpts = {
    scenario: 'base',
  },
) {
  const healthWorker: HealthWorkerWithGoogleTokens & {
    employee_id?: string
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
        approved_by: admin.id,
        health_worker_id: healthWorker.id,
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
  const healthWorker = await addTestHealthWorker(trx, opts)
  const session = await sessions.create(trx, 'health_worker', {
    entity_id: healthWorker.id,
  })

  const fetchWithSession: typeof fetch = (
    input: URL | RequestInfo,
    { headers, ...rest }: RequestInit = {},
  ) =>
    fetch(input, {
      headers: {
        ...headers,
        Cookie: `health_worker_session_id=${session.id}`,
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
    health_worker_session_id: session.id,
    healthWorker,
    fetch: fetchWithSession,
    fetchCheerio,
  }
}

export async function addTestRegulator(
  trx: TrxOrDb,
) {
  const createdRegulator = await regulators.upsert(trx, {
    ...testRegulator(),
  })
  return createdRegulator
}

export async function addTestRegulatorWithSession(
  trx: TrxOrDb,
) {
  const regulator = await addTestRegulator(trx)
  const session = await sessions.create(trx, 'regulator', {
    entity_id: regulator.id,
  })
  const fetchWithSession: typeof fetch = (
    input: URL | RequestInfo,
    { headers, ...rest }: RequestInit = {},
  ) =>
    fetch(input, {
      headers: {
        ...headers,
        Cookie: `regulator_session_id=${session.id}`,
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
    regulator_session_id: session.id,
    regulator,
    fetch: fetchWithSession,
    fetchCheerio,
  }
}

export async function addTestPharmacist(
  trx: TrxOrDb,
  pharmacist?: RenderedPharmacist,
) {
  const dummyPharmacist = {
    ...testPharmacist(),
    ...pharmacist,
  }
  const { id: pharmacistId } = await pharmacists.insert(trx, dummyPharmacist)
  return {
    id: pharmacistId,
    ...dummyPharmacist,
  }
}

export function removeTestPharmacist(
  trx: TrxOrDb,
  pharmacistId: string,
) {
  return pharmacists.remove(trx, pharmacistId)
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

export function withTestOrganization(
  trx: TrxOrDb,
  opts: (organization_id: string) => Promise<void>,
  callback?: undefined,
): Promise<void>

export function withTestOrganization(
  trx: TrxOrDb,
  opts: { kind: 'virtual' },
  callback: (organization_id: string) => Promise<void>,
): Promise<void>

export async function withTestOrganization(
  trx: TrxOrDb,
  opts: { kind: 'virtual' } | ((organization_id: string) => Promise<void>),
  callback?: (organization_id: string) => Promise<void>,
) {
  let kind: 'virtual' | 'physical' = 'physical'
  if (typeof opts === 'function') {
    callback = opts
  } else {
    kind = opts.kind
  }
  const organization = await organizations.add(trx, {
    name: kind === 'physical' ? 'Test Clinic' : 'Test Virtual Hospital',
    category: kind === 'physical' ? 'Clinic' : 'Virtual Hospital',
    address: kind === 'physical' ? '123 Test St' : undefined,
    latitude: kind === 'physical' ? 0 : undefined,
    longitude: kind === 'physical' ? 0 : undefined,
    // phone: null,
  })
  await callback!(organization!.id)
  await trx.deleteFrom('Address')
    .where('resourceId', '=', organization!.id)
    .execute()
  await trx.deleteFrom('Location')
    .where('organizationId', '=', organization!.id)
    .execute()
  await trx.deleteFrom('Organization')
    .where('id', '=', organization!.id)
    .execute()
}

export async function withTestOrganizations(
  trx: TrxOrDb,
  opts: { kind?: 'virtual' | 'physical'; count: number },
  callback: (organization_ids: string[]) => Promise<void>,
) {
  assert(opts.count > 0)
  const kind = opts.kind
  const organizations_added = await Promise.all(
    range(opts.count).map(() =>
      organizations.add(trx, {
        name: kind === 'physical' ? 'Test Clinic' : 'Test Virtual Hospital',
        category: kind === 'physical' ? 'Clinic' : 'Virtual Hospital',
        address: kind === 'physical' ? '123 Test St' : undefined,
        latitude: kind === 'physical' ? 0 : undefined,
        longitude: kind === 'physical' ? 0 : undefined,
        // phone: null,
      })
    ),
  )
  const organization_ids = organizations_added.map((organization) =>
    organization!.id
  )
  await callback(organization_ids)
  await trx.deleteFrom('Address')
    .where('resourceId', 'in', organization_ids)
    .execute()
  await trx.deleteFrom('Location')
    .where('organizationId', 'in', organization_ids)
    .execute()
  await trx.deleteFrom('Organization')
    .where('id', 'in', organization_ids)
    .execute()
}

export function readFirstFiveRowsOfSeedDump(
  file_name: string,
) {
  assert(
    !file_name.endsWith('.tsv') && !file_name.includes('/'),
    'file_name should just be the file name without the extension nor the path',
  )
  // deno-lint-ignore no-explicit-any
  let rows: any[]
  beforeAll(async () => {
    rows = await collect(take(parseTsv(`./db/seed/dumps/${file_name}.tsv`), 5))
  })
  return {
    get value() {
      if (!rows) {
        throw new Error(
          'rows not initialized, must be called in a describe block',
        )
      }
      return rows
    },
  }
}

export function readSeedDump(
  file_name: string,
) {
  assert(
    !file_name.endsWith('.tsv') && !file_name.includes('/'),
    'file_name should just be the file name without the extension nor the path',
  )
  // deno-lint-ignore no-explicit-any
  let rows: any[]
  beforeAll(async () => {
    rows = await collect(parseTsv(`./db/seed/dumps/${file_name}.tsv`))
  })
  return {
    get value() {
      if (!rows) {
        throw new Error(
          'rows not initialized, must be called in a describe block',
        )
      }
      return rows
    },
  }
}
