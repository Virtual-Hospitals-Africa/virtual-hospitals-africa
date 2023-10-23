import { SelectQueryBuilder, sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import {
  DatabaseSchema,
  Facility,
  Location,
  Maybe,
  Profession,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
import * as employment from './employment.ts'
import partition from '../../util/partition.ts'
import haveNames from '../../util/haveNames.ts'

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

export async function getAllWithNames(
  trx: TrxOrDb,
  search?: Maybe<string>,
): Promise<ReturnedSqlRow<Facility>[]> {
  let query = trx
    .selectFrom('facilities')
    .selectAll()
    .where('name', 'is not', null)

  if (search) query = query.where('name', 'ilike', `%${search}%`)

  const facilities = await query.execute()

  assert(haveNames(facilities))

  return facilities
}

export function get(
  trx: TrxOrDb,
  id: number,
): Promise<Maybe<ReturnedSqlRow<Facility>>> {
  return trx
    .selectFrom('facilities')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()
}

export function getFirstByHealthWorker(
  trx: TrxOrDb,
  healthWorkerId: number,
): Promise<Maybe<ReturnedSqlRow<Facility>>> {
  return trx
    .selectFrom('employment')
    .innerJoin(
      'facilities',
      'facilities.id',
      'employment.facility_id',
    )
    .where('employment.health_worker_id', '=', healthWorkerId)
    .selectAll('facilities')
    .executeTakeFirst()
}

export function getByHealthWorker(
  trx: TrxOrDb,
  healthWorkerId: number,
) {
  return trx
    .selectFrom('facilities')
    .innerJoin(
      'employment',
      'facilities.id',
      'employment.facility_id',
    )
    .where('employment.health_worker_id', '=', healthWorkerId)
    .groupBy('facilities.id')
    .selectAll('facilities')
    .execute()
}
export type EmployeeHealthWorker = {
  name: string
  is_invitee: false
  health_worker_id: number
  professions: Profession[]
  avatar_url: string
  email: string
  display_name: string
  href: string
}

export type EmployeeInvitee = {
  name: null
  is_invitee: true
  health_worker_id: null
  professions: Profession[]
  avatar_url: null
  email: string
  display_name: string
  href: null
}

export type FacilityEmployee = EmployeeHealthWorker | EmployeeInvitee

export function getEmployees(
  trx: TrxOrDb,
  opts: {
    facility_id: number
    include_invitees?: boolean
    emails?: string[]
  },
): Promise<FacilityEmployee[]> {
  let hwQuery: SelectQueryBuilder<
    DatabaseSchema,
    'health_workers',
    FacilityEmployee
  > = trx.selectFrom('health_workers')
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
      sql<
        string
      >`CONCAT('/app/facilities/', ${opts.facility_id}::text, '/health-workers/', health_workers.id::text)`
        .as('href'),
    ])
    .innerJoin('employment', 'employment.health_worker_id', 'health_workers.id')
    .where('employment.facility_id', '=', opts.facility_id)
    .groupBy('health_workers.id')

  if (opts.emails) {
    assert(Array.isArray(opts.emails))
    assert(opts.emails.length)
    hwQuery = hwQuery.where('health_workers.email', 'in', opts.emails)
  }

  if (!opts.include_invitees) {
    return hwQuery.execute()
  }

  let inviteeQuery: SelectQueryBuilder<
    DatabaseSchema,
    'health_worker_invitees',
    EmployeeInvitee
  > = trx.selectFrom('health_worker_invitees')
    .select([
      sql<null>`NULL`.as('health_worker_id'),
      sql<null>`NULL`.as('name'),
      'health_worker_invitees.email as email',
      'health_worker_invitees.email as display_name',
      sql<null>`NULL`.as('avatar_url'),
      sql<true>`TRUE`.as('is_invitee'),
      sql<
        Profession[]
      >`JSON_AGG(health_worker_invitees.profession ORDER BY health_worker_invitees.profession)`
        .as('professions'),
      sql<null>`NULL`.as('href'),
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

  return hwQuery.unionAll(inviteeQuery).execute()
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
