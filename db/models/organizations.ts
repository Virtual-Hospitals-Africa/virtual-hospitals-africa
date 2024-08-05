import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import {
  HasStringId,
  Location,
  Maybe,
  Organization,
  OrganizationDoctorOrNurse,
  OrganizationEmployee,
  OrganizationEmployeeOrInvitee,
  Profession,
  TrxOrDb,
} from '../../types.ts'
import * as employment from './employment.ts'
import partition from '../../util/partition.ts'
import { jsonAgg, jsonArrayFromColumn, jsonBuildObject } from '../helpers.ts'
import * as medplum from '../../external-clients/medplum/client.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertOr400, StatusError } from '../../util/assertOr.ts'

export async function nearest(
  trx: TrxOrDb,
  location: Location,
): Promise<HasStringId<Organization>[]> {
  const result = await sql<HasStringId<Organization>>`
      SELECT *,
             ST_Distance(
                  location,
                  ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
              ) AS distance,
              ST_X(location::geometry) as longitude,
              ST_Y(location::geometry) as latitude
        FROM "Location"
    ORDER BY location <-> ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
       LIMIT 10
  `.execute(trx)

  return result.rows
}

export function search(
  trx: TrxOrDb,
  opts: {
    search?: Maybe<string>
    kind?: Maybe<'physical' | 'virtual'>
  },
) {
  let query = trx
    .selectFrom('Organization')
    .leftJoin('Address', 'Organization.id', 'Address.resourceId')
    .leftJoin('Location', 'Organization.id', 'Location.organizationId')
    .select((eb) => [
      'Organization.id',
      'Organization.canonicalName as name',
      'Address.address',
      eb.ref('Address.address').as('description'),
    ])

  if (opts.search) {
    query = query.where(
      'Organization.canonicalName',
      'ilike',
      `%${opts.search}%`,
    )
  }
  if (opts.kind) {
    query = query.where(
      'address',
      opts.kind === 'physical' ? 'is not' : 'is',
      null,
    )
  }

  return query.execute()
}

export function get(
  trx: TrxOrDb,
  opts: {
    ids: string[]
  },
): Promise<HasStringId<Organization>[]> {
  assert(opts.ids.length, 'Must select nonzero organizations')
  return trx
    .selectFrom('Organization')
    .leftJoin('Address', 'Organization.id', 'Address.resourceId')
    .leftJoin('Location', 'Organization.id', 'Location.organizationId')
    .where('Organization.id', 'in', opts.ids)
    .select([
      'Organization.id',
      'Organization.canonicalName as name',
      'Address.address',
      sql<number>`ST_X(location::geometry)`.as('longitude'),
      sql<number>`ST_Y(location::geometry)`.as('latitude'),
    ])
    .execute()
}

type EmployeeQueryOpts = {
  professions?: Profession[]
  emails?: string[]
  is_approved?: boolean
  exclude_health_worker_id?: string
  active_hours: 3
}

export function getEmployeesQuery(
  trx: TrxOrDb,
  organization_id: string,
  opts: EmployeeQueryOpts,
) {
  let hwQuery = trx.selectFrom('health_workers')
    .innerJoin('employment', 'employment.health_worker_id', 'health_workers.id')
    .leftJoin(
      'nurse_registration_details',
      'nurse_registration_details.health_worker_id',
      'health_workers.id',
    )
    .select((eb) => [
      'health_workers.id as health_worker_id',
      'health_workers.name as name',
      'health_workers.email as email',
      'health_workers.name as display_name',
      'health_workers.avatar_url as avatar_url',
      // eb.selectFrom('health_worker_sessions')
      //   .whereRef('health_worker_sessions.entity_id', '=', 'health_workers.id')
      //   .select((eb_sessions) =>
      //     eb_sessions(
      //       'health_worker_sessions.updated_at',
      //       '>=',
      //       sql<Date>`NOW() - INTERVAL '1 hour'`,
      //     ).as('online')
      //   ).as('online'),
      sql<false>`FALSE`.as('is_invitee'),
      jsonArrayFromColumn(
        'profession_details',
        eb.selectFrom('employment')
          .leftJoin(
            'nurse_specialties',
            'nurse_specialties.employee_id',
            'employment.id',
          )
          .select((inner) => [
            jsonBuildObject({
              employee_id: inner.ref('employment.id'),
              profession: inner.ref('employment.profession'),
              specialty: inner.ref('nurse_specialties.specialty'),
            }).as('profession_details'),
          ])
          .whereRef(
            'employment.health_worker_id',
            '=',
            'health_workers.id',
          )
          .where('employment.organization_id', '=', organization_id)
          .where(
            'employment.profession',
            'in',
            opts.professions || ['admin', 'doctor', 'nurse'],
          )
          .groupBy([
            'employment.id',
            'nurse_specialties.specialty',
          ]).orderBy(['employment.profession asc']),
      ).as('professions'),
      jsonBuildObject({
        view: sql<
          string
        >`concat('/app/organizations/', ${organization_id}::text, '/employees/', health_workers.id::text)`,
      }).as('actions'),
      sql<'pending_approval' | 'approved' | 'incomplete'>`
        CASE
          WHEN nurse_registration_details.health_worker_id IS NULL THEN 'incomplete'
          WHEN nurse_registration_details.approved_by IS NULL
              AND JSON_AGG(employment.profession ORDER BY employment.profession)::text LIKE '%"nurse"%'
              THEN 'pending_approval'
          ELSE 'approved'
        END
      `.as('registration_status'),
    ])
    .where('employment.organization_id', '=', organization_id)
    .groupBy([
      'health_workers.id',
      'nurse_registration_details.approved_by',
      'nurse_registration_details.health_worker_id',
    ])

  if (opts.emails) {
    assert(Array.isArray(opts.emails))
    assert(opts.emails.length)
    hwQuery = hwQuery.where('health_workers.email', 'in', opts.emails)
  }
  if (opts.professions) {
    assert(opts.professions.length)
    hwQuery = hwQuery.where('employment.profession', 'in', opts.professions)
  }
  if (opts.is_approved) {
    hwQuery = hwQuery.where((eb) =>
      eb.or([
        eb('employment.profession', 'in', ['doctor', 'admin']),
        eb('nurse_registration_details.approved_by', 'is not', null),
      ])
    )
  }
  if (opts.exclude_health_worker_id) {
    hwQuery = hwQuery.where(
      'health_workers.id',
      '!=',
      opts.exclude_health_worker_id,
    )
  }

  if (opts.active_hours) {
    const now = new Date().getTime();
    const newTimestamp = new Date(now - (opts.active_hours * 60 * 60 * 1000));

    hwQuery = hwQuery.innerJoin(
      'health_worker_sessions',
      'health_worker_sessions.health_worker_id',
      'health_workers.id'
    ).where(
      'health_worker_sessions.updated_at',
      '>=',
      newTimestamp
    )
  }

  return hwQuery
}

export function getEmployees(
  trx: TrxOrDb,
  organization_id: string,
  opts: EmployeeQueryOpts = {},
): Promise<OrganizationEmployee[]> {
  return getEmployeesQuery(trx, organization_id, opts).execute()
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
  const hwQuery = getEmployeesQuery(trx, organization_id, opts)
  let inviteeQuery = trx.selectFrom('health_worker_invitees')
    .select((eb) => [
      sql<null | number>`NULL`.as('health_worker_id'),
      sql<null | string>`NULL`.as('name'),
      'health_worker_invitees.email as email',
      'health_worker_invitees.email as display_name',
      sql<null | string>`NULL`.as('avatar_url'),
      sql<boolean>`TRUE`.as('is_invitee'),
      jsonAgg(
        jsonBuildObject({
          profession: eb.ref('health_worker_invitees.profession'),
        }),
      ).as('professions'),
      jsonBuildObject({
        view: sql<null>`NULL`,
      }).as('actions'),
      sql<'pending_approval' | 'approved' | 'incomplete'>`'incomplete'`.as(
        'registration_status',
      ),
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

type OrganizationsData = {
  id?: string
  name: string
  latitude?: number
  longitude?: number
  address?: string
  category?: string
}

function interpretAddress(address: string) {
  const parts = address.split(', ')
  return {
    line: parts.slice(0, parts.length - 3),
    city: parts[parts.length - 3],
    state: parts[parts.length - 2],
    postalCode: parts[parts.length - 1],
  }
}

const categoryMap = {
  'Rural Health Centre': 'PC',
  'Clinic': 'PC',
  'Hospital': 'HOSP',
  'District Hospital': 'HOSP',
  'Military Hospital': 'MHSP',
}

const codeMap = {
  'PC': 'Primary care clinic',
  'HOSP': 'Hospital',
  'MHSP': 'Military Hospital',
}

export async function add(
  trx: TrxOrDb,
  { id, name, category, address, latitude, longitude }: OrganizationsData,
) {
  if (!category) {
    console.warn(`Skipping, no category found for organization: ${name}`)
    return
  }

  let status = 'active'
  const category_match = category.match(/(.*)(\(.*\))/)
  if (category_match) {
    category = category_match[1].trim()
    status = 'inactive'
  }

  const type = [{
    coding: [{
      system: 'http://terminology.hl7.org/CodeSystem/organization-type',
      code: 'prov',
      display: 'Healthcare Provider',
    }],
  }, {
    coding: [{
      system: 'virtualhospitalsafrica.org/codes/organization-category',
      code: category,
      display: category,
    }],
  }]

  const interpretedAddress = address && interpretAddress(address)
  const createdOrganization = await medplum.createResource('Organization', {
    name,
    type,
    active: true,
    address: interpretedAddress && [interpretedAddress],
  })

  // Hacky, but we want to explicitly set the ids of the test organizations and you can't do it
  // via the createResource call
  if (id) {
    await Promise.all([
      trx.updateTable('Organization')
        .set({ id })
        .where('id', '=', createdOrganization.id)
        .execute(),
      trx.updateTable('Address')
        .set({ resourceId: id })
        .where('resourceId', '=', createdOrganization.id)
        .execute(),
    ])

    createdOrganization.id = id
  }

  if (address && !Number.isNaN(latitude) && !Number.isNaN(longitude)) {
    const code = category && categoryMap[category as keyof typeof categoryMap]
    if (!code && category) {
      console.error(`No code found for category: ${category}`)
    }
    const display = code && codeMap[code as keyof typeof codeMap]
    const coding = [{
      code,
      display,
      system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
    }]

    const locationResponse = await medplum.createResource('Location', {
      status,
      name,
      type: [{ coding }],
      address: {
        use: 'work',
        type: 'both',
        ...interpretedAddress,
      },
      physicalType: {
        coding: [
          {
            system:
              'http://terminology.hl7.org/CodeSystem/location-physical-type',
            code: 'bu',
            display: 'Building',
          },
        ],
      },
      position: { longitude, latitude },
      managingOrganization: {
        reference: `Organization/${createdOrganization.id}`,
        display: name,
      },
    })
    assertEquals(locationResponse.position.longitude, longitude)
    assertEquals(locationResponse.position.latitude, latitude)
    const location = await trx.selectFrom('Location')
      .where('id', '=', locationResponse.id)
      .select('near')
      .executeTakeFirstOrThrow()

    const near = JSON.parse(location.near!)
    assertEquals(near.longitude, longitude)
    assertEquals(near.latitude, latitude)
  }

  return createdOrganization
}

// export function add(
//   trx: TrxOrDb,
//   { latitude, longitude, ...organization }: Organization,
// ) {
//   assert(Deno.env.get('IS_TEST'), 'Only allowed in test mode for now')
//   return trx
//     .insertInto('Organization')
//     .values({
//       ...organization,
//       location: (latitude != null && longitude != null)
//         ? sql`ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`
//         : null,
//     })
//     .returningAll()
//     .executeTakeFirstOrThrow()
// }

export function remove(
  trx: TrxOrDb,
  opts: {
    id: string
  },
) {
  assert(Deno.env.get('IS_TEST'), 'Only allowed in test mode for now')
  return trx.deleteFrom('Organization').where('id', '=', opts.id).execute()
}
