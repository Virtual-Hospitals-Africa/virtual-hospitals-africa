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
import { HealthWorkerWithGoogleTokens, TrxOrDb } from '../../types.ts'
import { testCalendars, testPharmacist, testRegulator } from '../mocks.ts'
import { addCalendars } from '../../db/models/providers.ts'
import { assertRejects } from 'std/assert/assert_rejects.ts'
import { assert } from 'std/assert/assert.ts'
import range from '../../util/range.ts'
import { collect } from '../../util/inParallel.ts'
import { parseTsv } from '../../util/parseCsv.ts'
import { take } from '../../util/take.ts'
import generateUUID from '../../util/uuid.ts'
import { OrganizationInsert } from '../../db/models/organizations.ts'
import last from '../../util/last.ts'

type TestHealthWorkerOpts = {
  scenario:
    | 'base'
    | 'doctor'
    | 'admin'
    | 'nurse'
    | 'approved-nurse'
    | 'awaiting-approval-nurse'
  organization_id?: string
  health_worker_attrs?: Partial<HealthWorkerWithGoogleTokens> & {
    department_name?: string
  }
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

  const department = await trx.selectFrom('organization_departments')
    .where('organization_id', '=', organization_id)
    .selectAll()
    .$if(
      !!health_worker_attrs?.department_name,
      (qb) =>
        qb.where(
          'organization_departments.name',
          '=',
          health_worker_attrs?.department_name!,
        ),
    )
    .executeTakeFirstOrThrow()

  switch (scenario) {
    case 'awaiting-approval-nurse': {
      const created_employee = await employment.addOne(trx, {
        organization_id,
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        department_id: department.id,
      })
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
      const admin_department = await trx.selectFrom('organization_departments')
        .where('organization_id', '=', organization_id)
        .selectAll()
        .where(
          'organization_departments.name',
          '=',
          'administration',
        )
        .executeTakeFirstOrThrow()
      const created_employee = await employment.addOne(trx, {
        organization_id,
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        department_id: department.id,
      })
      await employment.addOne(trx, {
        organization_id,
        health_worker_id: admin.id,
        profession: 'admin',
        department_id: admin_department.id,
      })
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
      const created_employee = await employment.addOne(trx, {
        organization_id,
        health_worker_id: healthWorker.id,
        profession: 'admin',
        department_id: department.id,
      })
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
      const created_employee = await employment.addOne(trx, {
        organization_id,
        health_worker_id: healthWorker.id,
        profession: 'doctor',
        department_id: department.id,
      })
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
      const created_employee = await employment.addOne(trx, {
        organization_id,
        health_worker_id: healthWorker.id,
        profession: 'nurse',
        department_id: department.id,
      })
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

  return { ...healthWorker, organization_id }
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
    fetch(
      typeof input === 'string' && input.startsWith('/')
        ? `${route}${input}`
        : input,
      {
        headers: {
          ...headers,
          Cookie: `health_worker_session_id=${session.id}`,
        },
        ...rest,
      },
    )

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
    fetch(
      typeof input === 'string' && input.startsWith('/')
        ? `${route}${input}`
        : input,
      {
        headers: {
          ...headers,
          Cookie: `regulator_session_id=${session.id}`,
        },
        ...rest,
      },
    )

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
  pharmacist?: pharmacists.PharmacistInsert,
) {
  const dummyPharmacist = {
    ...testPharmacist(),
    ...pharmacist,
  }
  const { id } = await pharmacists.insert(trx, dummyPharmacist)
  return {
    ...dummyPharmacist,
    id,
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
      const key = el.attribs.name && last(el.attribs.name.split('.'))
      set(
        formValues,
        el.attribs.name,
        el.attribs.value ? parseParam(key, el.attribs.value) : null,
      )
    }
  })
  $('form select').each((_i, el) => {
    let value = null
    $(el).find('option[selected]').each((_i, option) => {
      const key = option.attribs.name && last(el.attribs.name.split('!'))
      value = option.attribs.value && parseParam(key, option.attribs.value)
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

export function withTestOrganization(
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
  return withTestOrganizations(
    trx,
    { kind, count: 1 },
    async ([organization_id]) => {
      await callback!(organization_id)
    },
  )
}

export async function withTestOrganizations(
  trx: TrxOrDb,
  opts: { kind?: 'virtual' | 'physical'; count: number } | {
    kind?: 'virtual' | 'physical'
  }[],
  callback: (organization_ids: string[]) => Promise<void>,
) {
  const to_create = Array.isArray(opts) ? opts : (
    assert(opts.count > 0), range(opts.count).map((_) => ({ kind: opts.kind }))
  )

  const creating = to_create.map(({ kind }) => {
    const is_virtual = kind === 'virtual'
    const category = is_virtual ? 'Virtual Hospital' : 'Clinic'
    const name = `Test ${generateUUID()} ${category}`
    const to_create: OrganizationInsert = {
      name,
      category,
      departments_accepting_patients: ['immunizations', 'maternity'],
      administrative_departments: ['administration'],
    }
    if (!is_virtual) {
      to_create.address = {
        street: '123 Test St',
        locality: 'Test City',
        country: 'US',
        postal_code: '12345',
      }
      to_create.location = { latitude: 0, longitude: 0 }
    }

    return to_create
  })

  const organizations_added = await Promise.all(
    creating.map((org) => organizations.add(trx, org)),
  )
  const organization_ids = organizations_added.map((organization) =>
    organization.id
  )
  const address_ids = organizations_added.map((organization) =>
    organization.address_id
  )
  try {
    await callback(organization_ids)
  } finally {
    await trx.deleteFrom('organizations')
      .where('id', 'in', organization_ids)
      .execute()
    await trx.deleteFrom('addresses')
      .where('id', 'in', address_ids)
      .execute()
  }
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
