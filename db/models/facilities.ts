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
  approved: number
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
  approved: number
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
<<<<<<< HEAD
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
=======
  const result = await sql<FacilityEmployee>`
    SELECT
      FALSE AS is_invitee,
      health_workers.id AS health_worker_id,
      health_workers.name AS name,
      health_workers.email as email,
      health_workers.name as display_name,
      JSON_AGG(employment.profession ORDER BY employment.profession) AS professions,
      health_workers.avatar_url AS avatar_url,
      CONCAT('/app/facilities/', ${opts.facility_id}::text, '/health-workers/', health_workers.id::text) as href,
      (nurse_registration_details.approved_by IS NOT NULL)::int as approved
    FROM
      health_workers
    LEFT JOIN
      nurse_registration_details
    ON
      nurse_registration_details.health_worker_id = health_workers.id
    INNER JOIN
      employment
    ON
      employment.health_worker_id = health_workers.id
    WHERE
      employment.facility_id = ${opts.facility_id}
    GROUP BY
      health_workers.id, nurse_registration_details.approved_by
>>>>>>> add353d (moved approve button to nurse registration page)

  if (opts.emails) {
    assert(Array.isArray(opts.emails))
    assert(opts.emails.length)
    hwQuery = hwQuery.where('health_workers.email', 'in', opts.emails)
  }

<<<<<<< HEAD
  if (!opts.include_invitees) {
    return hwQuery.execute()
  }
=======
    SELECT
      TRUE AS is_invitee,
      NULL AS health_worker_id,
      NULL AS name,
      health_worker_invitees.email as email,
      health_worker_invitees.email as display_name,
      JSON_AGG(health_worker_invitees.profession ORDER BY health_worker_invitees.profession) AS professions,
      NULL AS avatar_url,
      NULL as href,
      0 as approved
    FROM
      health_worker_invitees
    WHERE
      health_worker_invitees.facility_id = ${opts.facility_id}
    AND
      TRUE = ${opts.include_invitees ? 'TRUE' : 'FALSE'}
    GROUP BY
      health_worker_invitees.id
>>>>>>> add353d (moved approve button to nurse registration page)

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
