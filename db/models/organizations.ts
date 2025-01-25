import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import {
  DoctorsWithoutAction,
  HasStringId,
  Location,
  Maybe,
  Organization,
  OrganizationDoctorOrNurse,
  OrganizationEmployee,
  OrganizationEmployeeOrInvitee,
  OrganizationEmployeeWithActions,
  Profession,
  TrxOrDb,
} from '../../types.ts'
import * as employment from './employment.ts'
import * as addresses from './addresses.ts'
import partition from '../../util/partition.ts'
import {
  jsonAgg,
  jsonBuildNullableObject,
  jsonBuildObject,
  literalLocation,
  literalNumber,
} from '../helpers.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertOr400, StatusError } from '../../util/assertOr.ts'
import { base } from './_base.ts'

export function baseQuery(trx: TrxOrDb) {
  return trx
    .selectFrom('organizations')
    .leftJoin('addresses', 'organizations.address_id', 'addresses.id')
    .select((eb) => [
      'organizations.id',
      'organizations.name',
      'organizations.category',
      'addresses.formatted as address',
      'addresses.formatted as description',
      literalNumber(12100).as('distance_meters'),
      sql<string>`'https://maps.google.com'`.as('google_maps_link'),
      jsonBuildNullableObject(eb.ref('location'), {
        longitude: sql<number>`ST_X(location::geometry)`,
        latitude: sql<number>`ST_Y(location::geometry)`,
      }).as('location'),
    ])
}

const model = base({
  top_level_table: 'organizations',
  baseQuery,
  formatResult: (x): HasStringId<Organization> => x,
  handleSearch(
    qb,
    opts: { search: string | null; kind: 'physical' | 'virtual' | null },
  ) {
    if (opts.search) {
      qb = qb.where('organizations.name', 'ilike', `%${opts.search}%`)
    }
    if (opts.kind) {
      qb = qb.where(
        'address_id',
        opts.kind === 'physical' ? 'is not' : 'is',
        null,
      )
    }
    return qb
  },
})

export const search = model.search
export const getById = model.getById
export const getByIds = model.getByIds

type EmployeeQueryOpts = {
  organization_id?: string
  professions?: Profession[]
  emails?: string[]
  is_approved?: boolean
  exclude_health_worker_id?: string
}

export function getEmploymentQuery(
  trx: TrxOrDb,
  opts: {
    organization_id?: string
    professions?: Profession[]
    is_approved?: boolean
    exclude_health_worker_id?: string
  },
) {
  return trx.with('organization_employment', (qb) => {
    let query = qb.selectFrom('employment')
      .leftJoin(
        'nurse_registration_details',
        'nurse_registration_details.health_worker_id',
        'employment.health_worker_id',
      )
      .selectAll('employment')
      .select([
        sql<'pending_approval' | 'approved' | 'incomplete'>`
          CASE
            WHEN employment.profession = 'admin' THEN 'approved'
            WHEN employment.profession = 'doctor' THEN 'approved'
            WHEN nurse_registration_details.health_worker_id IS NULL THEN 'incomplete'
            WHEN nurse_registration_details.approved_by IS NULL THEN 'pending_approval'
            ELSE 'approved'
          END
        `.as('registration_status'),
      ])
      .orderBy([
        'employment.health_worker_id asc',
        'employment.profession asc',
      ])

    if (opts.organization_id) {
      query = query.where(
        'employment.organization_id',
        '=',
        opts.organization_id,
      )
    }

    if (opts.professions) {
      assert(opts.professions.length)
      query = query.where('profession', 'in', opts.professions)
    }

    if (opts.is_approved) {
      query = query.where((eb) =>
        eb.or([
          eb('employment.profession', 'in', ['doctor', 'admin']),
          eb('nurse_registration_details.approved_by', 'is not', null),
        ])
      )
    }

    if (opts.exclude_health_worker_id) {
      query = query.where(
        'employment.health_worker_id',
        '!=',
        opts.exclude_health_worker_id,
      )
    }

    return query
  })
}

export function getEmployeesQuery(
  trx: TrxOrDb,
  organization_id: string,
  opts: EmployeeQueryOpts,
) {
  const health_workers_at_organization_query = getEmploymentQuery(trx, {
    ...opts,
    organization_id,
  }).with('health_workers_at_organization', (qb) => {
    return qb.selectFrom('organization_employment')
      .select(({ fn, ref }) => [
        'organization_employment.health_worker_id',
        sql`ARRAY_AGG(registration_status)`.as('registration_statuses'),
        fn.jsonAgg(
          jsonBuildObject({
            employee_id: ref('organization_employment.id'),
            profession: ref('organization_employment.profession'),
            specialty: ref('organization_employment.specialty'),
            registration_status: ref(
              'organization_employment.registration_status',
            ),
          }),
        ).as('professions'),
      ])
      .groupBy('organization_employment.health_worker_id')
  })

  return health_workers_at_organization_query.with(
    'organization_employees',
    (qb) => {
      let query = qb.selectFrom('health_workers_at_organization')
        .innerJoin(
          'health_workers',
          'health_workers.id',
          'health_workers_at_organization.health_worker_id',
        )
        .select((eb) => [
          'health_workers.id as health_worker_id',
          'health_workers.name as name',
          'health_workers.email as email',
          'health_workers.name as display_name',
          'health_workers.avatar_url as avatar_url',
          eb.selectFrom('health_worker_sessions')
            .whereRef(
              'health_worker_sessions.entity_id',
              '=',
              'health_workers.id',
            )
            .select(sql<boolean>`
            max(health_worker_sessions.updated_at) >= NOW() - INTERVAL '1 hour'
          `.as('online'))
            .groupBy('health_worker_sessions.entity_id')
            .as('online'),
          sql<false>`FALSE`.as('is_invitee'),
          'health_workers_at_organization.professions',
          sql<'pending_approval' | 'approved' | 'incomplete'>`
          CASE 
            WHEN 'pending_approval' = ANY(registration_statuses) THEN 'pending_approval'
            WHEN 'incomplete' = ANY(registration_statuses) THEN 'incomplete'
            ELSE 'approved'
          END
        `.as('registration_status'),
          jsonBuildObject({
            view: sql<
              string
            >`concat('/app/organizations/', ${organization_id}::text, '/employees/', health_workers.id::text)`,
          }).as('actions'),
        ])

      if (opts.emails) {
        assert(Array.isArray(opts.emails))
        assert(opts.emails.length)
        query = query.where('health_workers.email', 'in', opts.emails)
      }

      return query
    },
  )
}

export function getAllEmployeesWithoutActionQuery(
  trx: TrxOrDb,
  opts: EmployeeQueryOpts,
) {
  const health_workers_at_organization_query = getEmploymentQuery(trx, {
    ...opts,
  }).with('health_workers_at_organization', (qb) => {
    return qb.selectFrom('organization_employment')
      .select(({ fn, ref }) => [
        'organization_employment.health_worker_id',
        sql`ARRAY_AGG(registration_status)`.as('registration_statuses'),
        fn.jsonAgg(
          jsonBuildObject({
            employee_id: ref('organization_employment.id'),
            profession: ref('organization_employment.profession'),
            specialty: ref('organization_employment.specialty'),
            registration_status: ref(
              'organization_employment.registration_status',
            ),
          }),
        ).as('professions'),
      ])
      .groupBy('organization_employment.health_worker_id')
  })

  return health_workers_at_organization_query.with(
    'organization_employees',
    (qb) => {
      let query = qb.selectFrom('health_workers_at_organization')
        .innerJoin(
          'health_workers',
          'health_workers.id',
          'health_workers_at_organization.health_worker_id',
        )
        .select((eb) => [
          'health_workers.id as health_worker_id',
          'health_workers.name as name',
          'health_workers.email as email',
          'health_workers.name as display_name',
          'health_workers.avatar_url as avatar_url',
          eb.selectFrom('health_worker_sessions')
            .whereRef(
              'health_worker_sessions.entity_id',
              '=',
              'health_workers.id',
            )
            .select(sql<boolean>`
            max(health_worker_sessions.updated_at) >= NOW() - INTERVAL '1 hour'
          `.as('online'))
            .groupBy('health_worker_sessions.entity_id')
            .as('online'),
          sql<false>`FALSE`.as('is_invitee'),
          'health_workers_at_organization.professions',
          sql<'pending_approval' | 'approved' | 'incomplete'>`
          CASE 
            WHEN 'pending_approval' = ANY(registration_statuses) THEN 'pending_approval'
            WHEN 'incomplete' = ANY(registration_statuses) THEN 'incomplete'
            ELSE 'approved'
          END
        `.as('registration_status'),
        ])

      if (opts.emails) {
        assert(Array.isArray(opts.emails))
        assert(opts.emails.length)
        query = query.where('health_workers.email', 'in', opts.emails)
      }

      return query
    },
  )
}

export function getDoctorsWithoutAction(
  trx: TrxOrDb,
  opts: EmployeeQueryOpts = {},
): Promise<OrganizationEmployeeWithActions[]> {
  const employees = getAllEmployeesWithoutActionQuery(trx, opts).selectFrom(
    'organization_employees',
  ).selectAll('organization_employees').execute()
  return employees
}

export async function getApprovedDoctorsWithoutAction(
  trx: TrxOrDb,
  opts: Omit<EmployeeQueryOpts, 'is_approved' | 'professions' | 'actions'> = {},
): Promise<DoctorsWithoutAction[]> {
  const employees = await getDoctorsWithoutAction(trx, {
    ...opts,
    professions: ['doctor'],
    is_approved: true,
  })

  return employees.map(({ is_invitee, professions, ...rest }) => {
    assert(!is_invitee)
    assertEquals(professions.length, 1)
    const [{ profession, employee_id, specialty }] = professions
    assert(profession === 'doctor')

    return {
      ...rest,
      profession,
      employee_id,
      specialty,
    }
  })
}

export function getEmployees(
  trx: TrxOrDb,
  organization_id: string,
  opts: EmployeeQueryOpts = {},
): Promise<OrganizationEmployee[]> {
  return getEmployeesQuery(trx, organization_id, opts).selectFrom(
    'organization_employees',
  ).selectAll('organization_employees').execute()
}

export async function getApprovedProviders(
  trx: TrxOrDb,
  organization_id: string,
  opts: Omit<EmployeeQueryOpts, 'is_approved' | 'professions'> = {},
): Promise<OrganizationDoctorOrNurse[]> {
  const employees = await getEmployees(trx, organization_id, {
    ...opts,
    professions: ['doctor', 'nurse'],
    is_approved: true,
  })

  return employees.map(({ is_invitee, professions, ...rest }) => {
    assert(!is_invitee)
    assertEquals(professions.length, 1)
    const [{ profession, employee_id, specialty }] = professions
    assert(profession === 'doctor' || profession === 'nurse')

    return {
      ...rest,
      profession,
      employee_id,
      specialty,
    }
  })
}

export function getEmployeesAndInvitees(
  trx: TrxOrDb,
  organization_id: string,
  opts: {
    professions?: Profession[]
    emails?: string[]
  } = {},
): Promise<OrganizationEmployeeOrInvitee[]> {
  const hwQuery = getEmployeesQuery(trx, organization_id, opts).selectFrom(
    'organization_employees',
  ).selectAll('organization_employees')
  let inviteeQuery = trx.selectFrom('health_worker_invitees')
    .select((eb) => [
      sql<null | number>`NULL`.as('health_worker_id'),
      sql<null | string>`NULL`.as('name'),
      'health_worker_invitees.email as email',
      'health_worker_invitees.email as display_name',
      sql<null | string>`NULL`.as('avatar_url'),
      sql<null>`NULL`.as('online'),
      sql<boolean>`TRUE`.as('is_invitee'),
      jsonAgg(
        jsonBuildObject({
          profession: eb.ref('health_worker_invitees.profession'),
        }),
      ).as('professions'),
      sql<'pending_approval' | 'approved' | 'incomplete'>`'incomplete'`.as(
        'registration_status',
      ),
      jsonBuildObject({
        view: sql<null>`NULL`,
      }).as('actions'),
    ])
    .where('health_worker_invitees.organization_id', '=', organization_id)
    .groupBy('health_worker_invitees.email')

  if (opts.emails) {
    assert(Array.isArray(opts.emails))
    assert(opts.emails.length)
    inviteeQuery = inviteeQuery.where(
      'health_worker_invitees.email',
      'in',
      opts.emails,
    )
  }

  // deno-lint-ignore no-explicit-any
  return hwQuery.unionAll(inviteeQuery as any).execute()
}

export async function invite(
  trx: TrxOrDb,
  organization_id: string,
  invites: {
    email: string
    profession: Profession
  }[],
) {
  const invitedByEmail = new Map<string, Set<Profession>>()
  for (const { email, profession } of invites) {
    const professions = invitedByEmail.get(email)
    if (!professions) {
      invitedByEmail.set(email, new Set([profession]))
      continue
    }
    assertOr400(
      !professions.has(profession),
      `Cannot invite ${email} as a ${profession} more than once.`,
    )
    assertOr400(
      !((profession === 'doctor' && professions.has('nurse')) ||
        (profession === 'nurse' && professions.has('doctor'))),
      `Cannot invite ${email} as both a doctor and a nurse..`,
    )
    professions.add(profession)
  }

  const existingEmployees = await getEmployeesAndInvitees(
    trx,
    organization_id,
    {
      emails: [...invitedByEmail.keys()],
    },
  )

  const exactMatchingInvites = invites.filter(
    (invite) =>
      existingEmployees.some(
        (employee) =>
          invite.email === employee.email &&
          employee.professions.some(({ profession }) =>
            profession === invite.profession
          ),
      ),
  )

  if (exactMatchingInvites.length) {
    const [{ email, profession }] = exactMatchingInvites
    const message =
      `${email} is already employed as a ${profession}. Please remove them from the list.`
    throw new StatusError(message, 400)
  }

  const alreadyDoctorAndTryingToInviteAsNurseOrVisaVersa = invites.filter(
    (invite) =>
      existingEmployees.some(
        (employee) =>
          invite.email === employee.email &&
          employee.professions.some(({ profession }) => (
            (profession === 'doctor' && invite.profession === 'nurse') ||
            (profession === 'nurse' && invite.profession === 'doctor')
          )),
      ),
  )
  if (alreadyDoctorAndTryingToInviteAsNurseOrVisaVersa.length) {
    const [{ email, profession }] =
      alreadyDoctorAndTryingToInviteAsNurseOrVisaVersa
    const message = `${email} is already employed as a ${
      profession === 'nurse' ? 'doctor' : 'nurse'
    } so they can't also be employed as a ${profession}. Please remove them from the list.`
    throw new StatusError(message, 400)
  }

  const [inEmployeeTable, notInEmployeeTable] = partition(
    invites,
    (invite) =>
      existingEmployees.some((employee) => employee.email === invite.email),
  )

  if (inEmployeeTable.length) {
    await employment.add(
      trx,
      inEmployeeTable.map((invite) => ({
        organization_id,
        profession: invite.profession,
        health_worker_id: existingEmployees.find((employee) =>
          employee.email === invite.email
        )!.health_worker_id!,
      })),
    )
  }

  if (notInEmployeeTable.length) {
    await employment.addInvitees(
      trx,
      organization_id,
      notInEmployeeTable,
    )
  }
}

export type OrganizationInsert = {
  id?: string
  name: string
  category?: Maybe<string>
  inactive_reason?: string
  address?: addresses.AddressInsert
  location?: Location
}

export async function add(
  trx: TrxOrDb,
  {
    address,
    location,
    ...rest
  }: OrganizationInsert,
) {
  let address_id: string | undefined
  if (address) {
    const inserted_address = await addresses.insert(trx, address)
    address_id = inserted_address.id
  }
  return trx
    .insertInto('organizations')
    .values({
      ...rest,
      address_id,
      location: location && literalLocation(location),
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function remove(
  trx: TrxOrDb,
  opts: {
    id: string
  },
) {
  assert(Deno.env.get('IS_TEST'), 'Only allowed in test mode for now')
  return trx.deleteFrom('organizations').where('id', '=', opts.id).execute()
}
