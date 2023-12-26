import { sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import {
  Facility,
  Location,
  Maybe,
  Profession,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import * as employment from './employment.ts'
import partition from '../../util/partition.ts'

export async function nearest(
  trx: TrxOrDb,
  location: Location,
): Promise<ReturnedSqlRow<Facility>[]> {
  const result = await sql<ReturnedSqlRow<Facility>>`
      SELECT *,
             ST_Distance(
                  location,
                  ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
              ) AS distance,
              ST_X(location::geometry) as longitude,
              ST_Y(location::geometry) as latitude
        FROM facilities
    ORDER BY location <-> ST_SetSRID(ST_MakePoint(${location.longitude}, ${location.latitude}), 4326)::geography
       LIMIT 10
  `.execute(trx)

  return result.rows
}

export function search(
  trx: TrxOrDb,
  search?: Maybe<string>,
) {
  let query = trx
    .selectFrom('facilities')
    .select([
      'id',
      'address',
      sql`ST_X(location::geometry)`.as('longitude'),
      sql`ST_Y(location::geometry)`.as('latitude'),
      'category',
      'display_name',
      'phone',
    ])
    .where('display_name', 'is not', null)

  if (search) query = query.where('display_name', 'ilike', `%${search}%`)

  return query.execute()
}

export function get(
  trx: TrxOrDb,
  opts: {
    ids: number[]
  },
) {
  assert(opts.ids.length, 'Must select nonzero facilities')
  return trx
    .selectFrom('facilities')
    .where('id', 'in', opts.ids)
    .selectAll()
    .execute()
}

export type FacilityEmployee = {
  name: null | string
  is_invitee: boolean
  health_worker_id: null | number
  professions: Profession[]
  avatar_url: null | string
  email: string
  display_name: string
  href: null | string
  registration_status: 'pending_approval' | 'approved' | 'incomplete'
}

export function employeeHrefSql(facility_id: number) {
  return sql<
    string
  >`CONCAT('/app/facilities/', ${facility_id}::text, '/employees/', health_workers.id::text)`
}

export function getEmployees(
  trx: TrxOrDb,
  opts: {
    facility_id: number
    include_invitees?: boolean
    emails?: string[]
  },
): Promise<FacilityEmployee[]> {
  let hwQuery = trx.selectFrom('health_workers')
    .select([
      'health_workers.id as health_worker_id',
      'health_workers.name as name',
      'health_workers.email as email',
      'health_workers.name as display_name',
      'health_workers.avatar_url as avatar_url',
      sql<false>`FALSE`.as('is_invitee'),
      sql<
        Profession[]
      >`JSON_AGG(employment.profession ORDER BY employment.profession)`.as(
        'professions',
      ),
      employeeHrefSql(opts.facility_id).as('href'),
      sql<'pending_approval' | 'approved' | 'incomplete'>`CASE 
      WHEN nurse_registration_details.health_worker_id IS NULL THEN 'incomplete'
      WHEN nurse_registration_details.approved_by IS NULL 
            AND JSON_AGG(employment.profession ORDER BY employment.profession)::text LIKE '%"nurse"%' 
            THEN 'pending_approval'
      ELSE 'approved' END`.as('registration_status'),
    ])
    .innerJoin('employment', 'employment.health_worker_id', 'health_workers.id')
    .leftJoin(
      'nurse_registration_details',
      'nurse_registration_details.health_worker_id',
      'health_workers.id',
    )
    .where('employment.facility_id', '=', opts.facility_id)
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

  if (!opts.include_invitees) {
    return hwQuery.execute()
  }

  let inviteeQuery = trx.selectFrom('health_worker_invitees')
    .select([
      sql<null | number>`NULL`.as('health_worker_id'),
      sql<null | string>`NULL`.as('name'),
      'health_worker_invitees.email as email',
      'health_worker_invitees.email as display_name',
      sql<null | string>`NULL`.as('avatar_url'),
      sql<boolean>`TRUE`.as('is_invitee'),
      sql<
        Profession[]
      >`JSON_AGG(health_worker_invitees.profession ORDER BY health_worker_invitees.profession)`
        .as('professions'),
      sql<null>`NULL`.as('href'),
      sql<'pending_approval' | 'approved' | 'incomplete'>`'incomplete'`.as(
        'registration_status',
      ),
    ])
    .where('health_worker_invitees.facility_id', '=', opts.facility_id)
    .groupBy('health_worker_invitees.id')

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
  facility_id: number,
  invites: {
    email: string
    profession: Profession
  }[],
) {
  const existingEmployees = await getEmployees(trx, {
    facility_id,
    include_invitees: true,
    emails: invites.map((invite) => invite.email),
  })

  const matchingInvites = invites.filter(
    (invite) =>
      existingEmployees.some(
        (employee) =>
          invite.email === employee.email &&
          employee.professions.includes(invite.profession),
      ),
  )

  if (matchingInvites.length) {
    const [first] = matchingInvites
    const error =
      `${first.email} is already employed as a ${first.profession}, please remove them from the list`
    return { success: false, error }
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
        facility_id,
        profession: invite.profession,
        health_worker_id: existingEmployees.find((employee) =>
          employee.email === invite.email
        )!.health_worker_id as number,
      })),
    )
  }

  if (notInEmployeeTable.length) {
    await employment.addInvitees(
      trx,
      facility_id,
      notInEmployeeTable,
    )
  }

  return {
    success: true,
  }
}
